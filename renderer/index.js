// Get HTML elements
const discoverBtn = document.getElementById('discoverBtn');
const mealPlanBtn = document.getElementById('mealPlanBtn');

const discoverPage = document.getElementById('discoverPage');
const mealPlanPage = document.getElementById('mealPlanPage');

// Show Discover Recipes page
discoverBtn.addEventListener('click', function () {
    //stay on discover recipes page 
});

// Show My Meal Plans page
mealPlanBtn.addEventListener('click', function () {
    window.location.href = 'itinerary.html';
});

//to search recipes
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');

const recipeResults = document.getElementById('recipeResults');
const searchMessage = document.getElementById('searchMessage');
const suggestionMessage = document.getElementById('suggestionMessage');
//search recipes from TheMealDB API
class RecipeAPI{
    constructor(searchInput, categoryFilter, recipeResults,searchMessage, suggestionMessage){
        this.searchInput = searchInput;
        this.categoryFilter = categoryFilter;
        this.recipeResults = recipeResults;
        this.searchMessage = searchMessage;
        this.suggestionMessage = suggestionMessage;
    }
    //search recipe from TheMealDB API
    async searchRecipes() {
        const keyword = this.searchInput.value.trim();
        const category = this.categoryFilter.value;
        let url = '';

        if (keyword !==''){
            url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`;
        } else if (category !== '') {
            url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
        } else {
            this.recipeResults.innerHTML='';
            this.searchMessage.textContent = 'Please enter a recipe name or select a category.';
            this.suggestionMessage.textContent = 'Search for recipes to receive personalised suggestions.';
            return;
        }

        try{
            this.searchMessage.textContent = 'Searching recipes...';
            this.recipeResults.innerHTML = '';
            const response = await fetch(url);
            const data = await response.json();

            if(data.meals == null) {
                this.searchMessage.textContent = 'No recipes found. Try another search.';
                generateSuggestion();
                return;
            }
            displayRecipes(data.meals);
            generateSuggestion();

            this.searchMessage.textContent = `${data.meals.length} recipe(s) found.`;
        } catch(error) {
            this.searchMessage.textContent = 'Unable to load recipes. Please try again.';
        }
    }

    async viewRecipe(mealId) {
        try {
            const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
            const response = await fetch(url);
            const data = await response.json();
            const meal = data.meals[0];

            let ingredients = '';

            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];

                if (ingredient && ingredient.trim() !== '') {
                    ingredients += `${measure} ${ingredient}\n`;
                }
            }

            alert(
                 `RECIPE: ${meal.strMeal}\n\n` +
                 `CATEGORY: ${meal.strCategory}\n\n` +
                 `INGREDIENTS:\n${ingredients}\n` +
                 `INSTRUCTIONS:\n${meal.strInstructions}`
            );

        } catch (error) {
            alert('Unable to load recipe details. Please try again.');
        }
    }
}
//create RecipeAPI object 
const recipeAPI = new RecipeAPI(
    searchInput,
    categoryFilter,
    recipeResults,
    searchMessage,
    suggestionMessage
);
//to display recipes on the page 
function displayRecipes(meals){
    recipeResults.innerHTML = '';

    meals.forEach(function(meal){
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';

        recipeCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <button class="view-btn">View Recipe</button>
            <button class="save-btn">Save Recipe</button> `;

        const viewBtn = recipeCard.querySelector('.view-btn');
        const saveBtn = recipeCard.querySelector('.save-btn');
        viewBtn.addEventListener('click',function(){
            recipeAPI.viewRecipe(meal.idMeal);
        });

        saveBtn.addEventListener('click',function(){
            mealPlan.saveRecipe(meal);
        });

        recipeResults.appendChild(recipeCard);
    });
}

//MealPlan class to manage saved recipes
class MealPlan{
    saveRecipe(meal){
        let mealPlans = JSON.parse(localStorage.getItem('easyCookMealPlans')) || [];

        const alreadySaved = mealPlans.some(function (savedMeal) {
            return savedMeal.idMeal === meal.idMeal;
        });

        if (alreadySaved) {
            alert('This recipe is already saved!');
            return;
        }

        mealPlans.push(meal);

        localStorage.setItem('easyCookMealPlans', JSON.stringify(mealPlans));

        alert('Recipe saved successfully!');
    }
    //delete recipe from local storage
    deleteRecipe(mealId) {
        let mealPlans = JSON.parse(localStorage.getItem('easyCookMealPlans')) || [];

        mealPlans = mealPlans.filter(function (meal) {
            return meal.idMeal !== mealId;
        });

        localStorage.setItem('easyCookMealPlans', JSON.stringify(mealPlans));

        displayMealPlans();
    }
}
//creatre MealPlan object
const mealPlan = new MealPlan();
//display saved recipes
function displayMealPlans() {
    const mealPlanResults = document.getElementById('mealPlanResults');
    //local storage
    const mealPlans = JSON.parse(localStorage.getItem('easyCookMealPlans')) || [];

    mealPlanResults.innerHTML = '';

    if (mealPlans.length === 0) {
        mealPlanResults.textContent = 'No saved recipes yet. Save a recipe first!';
        return;
    }

    mealPlans.forEach(function (meal) {
        const mealCard = document.createElement('div');
        mealCard.className = 'recipe-card';

        mealCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <button class="delete-btn">Delete</button> `;

        const deleteBtn = mealCard.querySelector('.delete-btn');

        deleteBtn.addEventListener('click', function(){
            mealPlan.deleteRecipe(meal.idMeal);
        });
        mealPlanResults.appendChild(mealCard);
    });
}
//for the search button event 
searchBtn.addEventListener('click', function(){
    recipeAPI.searchRecipes();
});

//search when the enter key is pressed
searchInput.addEventListener('keydown', function (event) {
    if(event.key === 'Enter'){
        recipeAPI.searchRecipes();
    }
});
categoryFilter.addEventListener('change', function () {
    recipeAPI.searchRecipes();
});

//to generate recipe suggestions 
function generateSuggestion(){
   const keyword = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    if (category === 'Dessert') {
        suggestionMessage.textContent =
            'For your next dessert, try exploring new recipes!';

    } else if (category === 'Vegetarian') {
        suggestionMessage.textContent =
            'Try a healthy vegetarian meal today!';

    } else if (category === 'Seafood') {
        suggestionMessage.textContent =
            'Seafood recipes are a great choice for your next meal!';

    } else if (category === 'Chicken' || keyword.includes('chicken')) {
        suggestionMessage.textContent =
            'Chicken is versatile! Try a simple chicken dish today.';

    } else if (category === 'Pasta' || keyword.includes('pasta')) {
        suggestionMessage.textContent =
            'How about trying a delicious pasta recipe?';

    } else if (keyword !== '') {
        suggestionMessage.textContent =
            'Let us explore the recipes and discover something new!';

    } else {
        suggestionMessage.textContent =
            'Search for recipes to receive personalised suggestions.';
    }
}
//cooking measurement 
// get converter elements
const measurementInput = document.getElementById('measurementInput');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const convertBtn = document.getElementById('convertBtn');
const conversionResult = document.getElementById('conversionResult');
const conversionMessage = document.getElementById('conversionMessage');
// function to convert cooking measurements
class MeasurementConverter {
    constructor(input,fromUnit, toUnit, result,message){
        this.input = input;
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.result = result;
        this.message = message;
    }
    //convert cooking measurement
    convertMeasurement(){
        const amount = Number(this.input.value);
        const from = this.fromUnit.value;
        const to = this.toUnit.value;

        let result = 0;

        if (this.input.value === '' || !Number.isFinite(amount) || amount < 0) {
            this.message.textContent = 'Please enter a valid amount.';
            this.result.textContent = 'No result available.';
            return;
        }

        if (from === to) {
            result = amount;

        } else if (from === 'g' && to === 'kg') {
            result = amount / 1000;

        } else if (from === 'kg' && to === 'g') {
            result = amount * 1000;

        } else if (from === 'ml' && to === 'L') {
            result = amount / 1000;

        } else if (from === 'L' && to === 'ml') {
            result = amount * 1000;

        } else if (from === 'tbsp' && to === 'tsp') {
            result = amount * 3;

        } else if (from === 'tsp' && to === 'tbsp') {
            result = amount / 3;

        } else {
            this.message.textContent = 'These units cannot be converted.';
            this.result.textContent = 'Please select a compatible units.';
            return;
        }
        result = Number(result.toFixed(2));
        this.message.textContent = 'Conversion successful!';
        this.result.textContent = `${amount} ${from} = ${result} ${to}`;
    }
}
//create object 
const converter = new MeasurementConverter(
    measurementInput, 
    fromUnit,
    toUnit,
    conversionResult,
    conversionMessage
);

convertBtn.addEventListener('click', function(){
    converter.convertMeasurement();
})