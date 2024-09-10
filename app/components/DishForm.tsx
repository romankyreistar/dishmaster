'use client';

import { useState } from 'react';
import { updateDishIngredients } from '@/app/actions/updateDishIngredients';

export default function DishForm() {
  const [chefId, setChefId] = useState<number>(1);
  const [dishId, setDishId] = useState<number>(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredientId: 0, ingredientAmount: 0 }]);
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredients(
      ingredients.filter((ingredient, ingredientIndex) => ingredientIndex !== index)
    );
  };

  const handleIngredientChange = (
    index: number,
    field: string,
    value: number
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updateDishIngredients({
        chefId: chefId,
        dishId: dishId,
        ingredients: ingredients,
      });
      alert('Dish updated successfully!');
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className='flex-col text-center'>
      <div>
        <label>
          Chef ID:
          <input
            type='number'
            value={chefId}
            onChange={(e) => setChefId(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Dish ID:
          <input
            type='number'
            value={dishId}
            onChange={(e) => setDishId(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <h3>Ingredients:</h3>
        {ingredients.map((ingredient, index) => (
          <div className='gap-1' key={index}>
            <label>
              Ingredient ID:
              <input
                type='number'
                value={ingredient.ingredientId}
                onChange={(e) =>
                  handleIngredientChange(
                    index,
                    'ingredientId',
                    Number(e.target.value)
                  )
                }
              />
            </label>
            <label>
              Ingredient Amount (%):
              <input
                type='number'
                value={ingredient.ingredientAmount}
                onChange={(e) =>
                  handleIngredientChange(
                    index,
                    'ingredientAmount',
                    Number(e.target.value)
                  )
                }
              />
            </label>

            <button onClick={() => handleDeleteIngredient(index)}>
              Delete
            </button>
          </div>
        ))}
        <button
          type='button'
          onClick={handleAddIngredient}
          disabled={isLoading}
        >
          Add Ingredient
        </button>
      </div>
      <button type='button' onClick={handleSubmit} disabled={isLoading}>
        Update Dish
      </button>
    </div>
  );
}
