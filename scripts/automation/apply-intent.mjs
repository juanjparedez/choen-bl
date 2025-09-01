// scripts/automation/apply-intent.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

async function readLatestIntentFromDisk() {
	const intentsDir = path.join(ROOT, 'automation', 'intents');
	await fs.mkdir(intentsDir, { recursive: true });
	const files = (await fs.readdir(intentsDir))
		.filter(f => f.endsWith('.json'))
		.sort()
		.reverse();
	if (!files.length) return null;
	const content = await fs.readFile(path.join(intentsDir, files[0]), 'utf8');
	return content;
}

function parseIntent(jsonStr) {
	if (!jsonStr) throw new Error('Intent JSON vacío.');
	const intent = JSON.parse(jsonStr);
	if (!intent || typeof intent !== 'object')
		throw new Error('Intent inválido.');
	if (!intent.type) throw new Error('Intent sin "type".');
	return intent;
}

async function ensureDir(p) {
	await fs.mkdir(p, { recursive: true });
}

async function writeFileIfChanged(filePath, content) {
	try {
		const current = await fs.readFile(filePath, 'utf8');
		if (current === content) {
			console.log(`Sin cambios: ${path.relative(ROOT, filePath)}`);
			return false;
		}
	} catch (_) {}
	await ensureDir(path.dirname(filePath));
	await fs.writeFile(filePath, content);
	console.log(`Escrito: ${path.relative(ROOT, filePath)}`);
	return true;
}

async function createComponent(component) {
	if (!component?.name || !component?.code)
		throw new Error('component.name y component.code son requeridos');
	const componentPath = path.join(ROOT, 'components', `${component.name}.tsx`);
	return writeFileIfChanged(componentPath, component.code);
}

async function createPage(page) {
	// page: { path: 'app/series/page.tsx', code: '...' }  (o app/series/[id]/page.tsx)
	if (!page?.path || !page?.code)
		throw new Error('page.path y page.code requeridos');
	const absolute = path.join(ROOT, page.path);
	return writeFileIfChanged(absolute, page.code);
}

function extractModelNames(prismaSnippet) {
	const names = [];
	const re = /\bmodel\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
	let m;
	while ((m = re.exec(prismaSnippet))) names.push(m[1]);
	return names;
}

async function appendPrismaModels(addition) {
	const schemaPath = path.join(ROOT, 'prisma', 'schema.prisma');
	let schema = '';
	try {
		schema = await fs.readFile(schemaPath, 'utf8');
	} catch {
		throw new Error('No se encontró prisma/schema.prisma');
	}

	const models = extractModelNames(addition);
	let toAppend = addition.trim();

	// Si ya existen todos los modelos, no hacemos nada
	const allExist =
		models.length > 0 &&
		models.every(name => new RegExp(`\\bmodel\\s+${name}\\b`).test(schema));
	if (allExist) {
		console.log('Modelos ya presentes en schema.prisma, sin cambios.');
		return false;
	}

	// Append con separación limpia
	let newSchema = schema;
	if (!newSchema.endsWith('\n')) newSchema += '\n';
	newSchema += '\n' + toAppend + '\n';

	await fs.writeFile(schemaPath, newSchema);
	console.log('schema.prisma actualizado (append de modelos).');
	return true;
}

async function updatePrismaSchema(schema) {
	if (!schema?.addition) throw new Error('schema.addition requerido');
	return appendPrismaModels(schema.addition);
}

async function createAPIRoute(route) {
	// route: { path: 'app/api/tags/route.ts', code: '...' }
	if (!route?.path || !route?.code)
		throw new Error('route.path y route.code requeridos');
	const absolute = path.join(ROOT, route.path);
	return writeFileIfChanged(absolute, route.code);
}

async function addTagsSystem(tags) {
	// 1) schema
	await updatePrismaSchema({
		addition: `
model Tag {
  id     String  @id @default(cuid())
  name   String  @unique
  color  String  @default("#3b82f6")
  series Serie[] @relation("SerieTags")

  @@map("tags")
}

model SerieTag {
  serie   Serie @relation(fields: [serieId], references: [id], onDelete: Cascade, name: "SerieTags")
  serieId String
  tag     Tag   @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId   String

  @@id([serieId, tagId])
  @@map("serie_tags")
}
`.trim(),
	});

	// 2) componente
	if (tags?.componentCode) {
		await createComponent({ name: 'TagsManager', code: tags.componentCode });
	}

	// 3) API
	if (tags?.apiCode) {
		await createAPIRoute({ path: 'app/api/tags/route.ts', code: tags.apiCode });
	}
}

async function applyIntent() {
	const envIntent = process.env.INTENT_JSON;
	const json = envIntent ?? (await readLatestIntentFromDisk());
	const intent = parseIntent(json);

	console.log(`Aplicando intent: ${intent.type}`);

	switch (intent.type) {
		case 'add_component':
			await createComponent(intent.component);
			break;
		case 'add_page':
			await createPage(intent.page);
			break;
		case 'update_schema':
			await updatePrismaSchema(intent.schema);
			break;
		case 'add_api_route':
			await createAPIRoute(intent.route);
			break;
		case 'add_tags_system':
			await addTagsSystem(intent.tags);
			break;
		default:
			console.log(`Tipo de intent no reconocido: ${intent.type}`);
	}
}

applyIntent().catch(err => {
	console.error('Fallo apply-intent:', err);
	process.exitCode = 1;
});
