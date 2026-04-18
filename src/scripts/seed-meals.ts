import { randomUUID } from 'node:crypto';
import { connection } from '../database';

const sampleMeals = [
  { name: 'Omelete com espinafre', description: 'Café da manhã proteico', isOnDiet: true },
  { name: 'Aveia com banana', description: 'Café reforçado pré-treino', isOnDiet: true },
  { name: 'Pão francês com requeijão', description: 'Quebrou a dieta no café', isOnDiet: false },
  { name: 'Frango grelhado com salada', description: 'Almoço limpo', isOnDiet: true },
  { name: 'Arroz integral com atum', description: 'Almoço pós-treino', isOnDiet: true },
  { name: 'Hambúrguer artesanal', description: 'Fim de semana com os amigos', isOnDiet: false },
  { name: 'Iogurte natural com granola', description: 'Lanche da tarde', isOnDiet: true },
  { name: 'Batata doce com patinho', description: 'Almoço de bulking', isOnDiet: true },
  { name: 'Pizza de calabresa', description: 'Jantar em família', isOnDiet: false },
  { name: 'Salmão assado com legumes', description: 'Jantar rico em ômega 3', isOnDiet: true },
  { name: 'Shake de whey com aveia', description: 'Pré-treino rápido', isOnDiet: true },
  { name: 'Brigadeiro', description: 'Aniversário do colega', isOnDiet: false },
  { name: 'Tapioca com ovo', description: 'Café da manhã leve', isOnDiet: true },
  { name: 'Sopa de legumes', description: 'Jantar leve', isOnDiet: true },
  { name: 'Açaí com leite condensado', description: 'Sobremesa calórica', isOnDiet: false },
  { name: 'Peito de peru com queijo branco', description: 'Lanche da tarde', isOnDiet: true },
  { name: 'Macarrão à bolonhesa', description: 'Almoço integral', isOnDiet: true },
  { name: 'Coxinha de padaria', description: 'Lanche fora do plano', isOnDiet: false },
  { name: 'Ovos mexidos com abacate', description: 'Café low-carb', isOnDiet: true },
  { name: 'Wrap de frango com homus', description: 'Almoço prático', isOnDiet: true },
  { name: 'Cerveja com amendoim', description: 'Happy hour', isOnDiet: false },
  { name: 'Salada caesar com frango', description: 'Almoço executivo', isOnDiet: true },
  { name: 'Quinoa com vegetais', description: 'Jantar vegetariano', isOnDiet: true },
  { name: 'Churrasco com maionese', description: 'Almoço de domingo', isOnDiet: false },
  { name: 'Crepioca com frango', description: 'Café alto em proteína', isOnDiet: true },
  { name: 'Panqueca de banana', description: 'Café fit', isOnDiet: true },
  { name: 'Sorvete de chocolate', description: 'Sobremesa', isOnDiet: false },
  { name: 'Arroz com feijão e bife', description: 'Almoço clássico', isOnDiet: true },
  { name: 'Grão de bico com atum', description: 'Jantar rápido', isOnDiet: true },
  { name: 'Refrigerante com pastel', description: 'Feira de sábado', isOnDiet: false },
];

async function seed() {
  let user = await connection('users').first();

  if (!user) {
    const id = randomUUID();
    await connection('users').insert({
      id,
      session_id: randomUUID(),
      name: 'Seed User',
      email: `seed-${Date.now()}@example.com`,
    });
    user = await connection('users').where({ id }).first();
    console.log(`Created seed user: ${user.id}`);
  } else {
    console.log(`Using existing user: ${user.id}`);
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const rows = sampleMeals.map((meal, i) => ({
    id: randomUUID(),
    user_id: user.id,
    name: meal.name,
    description: meal.description,
    is_on_diet: meal.isOnDiet,
    date: now - (sampleMeals.length - i) * (oneDay / 2),
  }));

  await connection('meals').insert(rows);
  console.log(`Inserted ${rows.length} meals for user ${user.id}`);

  await connection.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
