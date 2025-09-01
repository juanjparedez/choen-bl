// scripts/automation/apply-intent.mjs
import fs from 'fs/promises';
import path from 'path';

const intent = JSON.parse(process.env.INTENT_JSON);

async function applyIntent() {
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

async function createComponent(component) {
  const componentPath = `app/components/${component.name}.tsx`;
  await fs.writeFile(componentPath, component.code);
  console.log(`Componente creado: ${componentPath}`);
}

async function updatePrismaSchema(schema) {
  const schemaPath = 'prisma/schema.prisma';
  const currentSchema = await fs.readFile(schemaPath, 'utf8');
  
  // Buscar donde insertar el nuevo modelo
  const insertPoint = currentSchema.lastIndexOf('}');
  const newSchema = currentSchema.slice(0, insertPoint) + 
                   schema.addition + '\n' + 
                   currentSchema.slice(insertPoint);
  
  await fs.writeFile(schemaPath, newSchema);
  console.log('Schema actualizado');
}

async function addTagsSystem(tags) {
  // Actualizar schema.prisma
  await updatePrismaSchema({
    addition: `
model Tag {
  id     String @id @default(cuid())
  name   String @unique
  color  String @default("#3b82f6")
  series Serie[]

  @@map("tags")
}

model SerieTag {
  serie   Serie  @relation(fields: [serieId], references: [id], onDelete: Cascade)
  serieId String
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId   String

  @@id([serieId, tagId])
  @@map("serie_tags")
}`
  });

  // Crear componente TagsManager
  await createComponent({
    name: 'TagsManager',
    code: tags.componentCode
  });

  // Crear API route para tags
  await createAPIRoute({
    path: 'app/api/tags/route.ts',
    code: tags.apiCode
  });
}

async function createAPIRoute(route) {
  await fs.mkdir(path.dirname(route.path), { recursive: true });
  await fs.writeFile(route.path, route.code);
  console.log(`API route creada: ${route.path}`);
}

applyIntent().catch(console.error);