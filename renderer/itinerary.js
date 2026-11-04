const mealPlanResults = document.getElementById('mealPlanResults');
const discoverBtn = document.getElementById('discoverBtn');
// Go back to Discover Recipes page
discoverBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
});
// Display saved recipes
function displayMealPlans() {
    const savedMeals = JSON.parse(localStorage.getItem('easyCookMealPlans')) || [];

    mealPlanResults.innerHTML = '';

    if (savedMeals.length === 0) {
        mealPlanResults.innerHTML = '<p>No saved recipes yet.</p>';
        return;
    }

    savedMeals.forEach(function (meal) {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        recipeCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>

            <button class="view-btn">View Recipe</button>

            <div class="date-section">
                <label>Planned Cooking Date:</label>
                <input type="date" class="planned-date">
                <button class="update-btn">Update Date</button>
            </div>

            <button class="delete-btn">Delete</button>
        `;

        const dateInput = recipeCard.querySelector('.planned-date');
        const viewBtn = recipeCard.querySelector('.view-btn');
        const updateBtn = recipeCard.querySelector('.update-btn');
        const deleteBtn = recipeCard.querySelector('.delete-btn');

        // Display previously saved date
        dateInput.value = meal.plannedDate || '';

        // View recipe details
        viewBtn.addEventListener('click', function () {
            viewRecipe(meal.idMeal);
        });

        // Update planned cooking date
        updateBtn.addEventListener('click', function () {
          mealPlan.updateRecipe(meal.idMeal, dateInput.value);
        });

        // Delete saved recipe
        deleteBtn.addEventListener('click', function () {
            mealPlan.deleteRecipe(meal.idMeal);
        });

        mealPlanResults.appendChild(recipeCard);
    });
}

// View recipe details
async function viewRecipe(mealId) {
    try {
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
        );

        const data = await response.json();
        if(!data.meals){
            alert('Recipe not found.');
            return;
        }

        const meal = data.meals[0];
        alert(
            `Recipe: ${meal.strMeal}\n\n` +
            `Category: ${meal.strCategory}\n\n` +
            `Instructions:\n${meal.strInstructions}`
        );

    } catch (error) {
        alert('Unable to load recipe details.');
    }
}

//MealPlan class 
class MealPlan{
    // Update planned cooking date
    updateRecipe(mealId, newDate) {
        let savedMeals = JSON.parse(localStorage.getItem('easyCookMealPlans')) || [];

        if (newDate === '') {
            alert('Please select a cooking date.');
            return;
        }

        savedMeals = savedMeals.map(function (meal) {
            if (meal.idMeal === mealId) {
                meal.plannedDate = newDate;
            }
            return meal;
        });

        localStorage.setItem('easyCookMealPlans', JSON.stringify(savedMeals));

        alert('Cooking date updated successfully!');

        displayMealPlans();
    }
    //delete saved recipe
    deleteRecipe(mealId) {
        let savedMeals = JSON.parse(localStorage.getItem('easyCookMealPlans')) || [];

        savedMeals = savedMeals.filter(function (meal) {
            return meal.idMeal !== mealId;
        });

        localStorage.setItem('easyCookMealPlans', JSON.stringify(savedMeals));

        displayMealPlans();
    }
}
//MealPlan object
const mealPlan = new MealPlan();
// Display recipes when page loads
displayMealPlans();



