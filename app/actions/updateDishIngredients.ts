'use server'

import { supabase } from '@/lib/supabaseClient';

type UpdateDishIngredientsParams = {
  chefId: number;
  dishId: number;
  ingredients: Array<Ingredient>;
};

export const updateDishIngredients = async ({
  chefId,
  dishId,
  ingredients,
}: UpdateDishIngredientsParams) => {
  // Fetch the dish to confirm it exists
  const { data: dish, error: dishError } = await supabase
    .from('dishes')
    .select('id, chef_id, version_number')
    .eq('id', dishId)
    .single();

  // Check if the dish exists
  if (dishError) {
    throw new Error('Dish not found');
  }

  // Check if the dish belongs to the specific chef
  if (dish.chef_id !== chefId) {
    throw new Error('You do not have permission to update this dish');
  }

  // Validate the existence of each ingredient
  const ingredientIds = ingredients.map(
    (ingredient) => ingredient.ingredientId
  );
  const { data: validIngredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('id')
    .in('id', ingredientIds);

  if (ingredientsError || validIngredients.length !== ingredientIds.length) {
    throw new Error('One or more ingredients do not exist');
  }

  // Delete ingredients that are no longer needed
  const { error: deleteError } = await supabase
    .from('dish_ingredients')
    .delete()
    .eq('dish_id', dishId)
    .not('ingredient_id', 'in', `(${ingredientIds.join(',')})`);
    
  if (deleteError) {
    throw new Error('Failed to delete unnecessary ingredients');
  }

  // Upsert the ingredients (insert if they don't exist, update if they do)
  const upsertData = ingredients.map((ingredient) => ({
    dish_id: dishId,
    ingredient_id: ingredient.ingredientId,
    ingredient_amount: ingredient.ingredientAmount,
  }));

  const { error: upsertError } = await supabase
    .from('dish_ingredients')
    .upsert(upsertData, { onConflict: 'dish_id, ingredient_id' });

  if (upsertError) {
    throw new Error('Failed to upsert ingredients');
  }

  // Update the dish's version number
  const { error: updateError } = await supabase
    .from('dishes')
    .update({ version_number: dish.version_number + 1 })
    .eq('id', dishId);

  if (updateError) {
    throw new Error('Failed to update dish version');
  }

  return { success: true };
};
