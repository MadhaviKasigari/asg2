import React, { useEffect, useReducer } from "react";
import RecipeCard from "./components/RecipeCard";
import Recipe from "./components/Recipe";
import Icon from "./components/Icon";
import Input from "./components/Input";
import AddRecipe from "./components/AddRecipe";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  recipes: [],
  recipeId: "",
  searchKeyword: "",
  showUI: "home-view",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "load-recipes":
      return { ...state, recipes: action.data };
    default:
      throw new Error();

    case "show-recipe":
      return {
        ...state,
        recipeId: action.recipeId,
        showUI: "recipe-view",
      };
    case "exit-recipe":
      return {
        ...state,
        recipeId: "",
        showUI: "home-view",
        searchKeyword: "",
      };
    case "set-search-keyword":
      return {
        ...state,
        searchKeyword: action.keyword,
      };
    case "show-add-recipe":
      return {
        ...state,
        showUI: "add-recipe-view",
      };
    case "exit-add-recipe":
      return {
        ...state,
        showUI: "home-view",
        searchKeyword: "",
      };
    case "add-recipe":
      return {
        ...state,
        recipes: [...state.recipes, action.recipe],
        showUI: "home-view",
        searchKeyword: "",
      };
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const showRecipe = (recipeId) => dispatch({ type: "show-recipe", recipeId });
  useEffect(() => {
    fetch("/api/recipes")
      // fetch("https://localhost:3000/recipes")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "load-recipes", data }));
  }, []);
  useEffect(() => {
    fetch(`/api/recipe.title/${state.searchKeyword}`)
      // fetch(`https://localhost:3000/recipes/title/${state.searchKeyword}`)
      .then((res) => res.json())
      .then((data) => dispatch({ type: "load-recipes", data: data.recipes }));
  }, [state.searchKeyword]);
  const filterRecipes = (keyword) =>
    dispatch({ type: "set-search-keyword", keyword });

  return (
    <>
      <div className="recipe-meister">
        <h1>Recipe Meister</h1>
        {state.showUI === "home-view" && (
          <div id="controls">
            <Input
              label="FIND RECIPES"
              onInput={(evt) => filterRecipes(evt.target.value)}
              value={state.searchKeyword}
            />
            <button
              className="btn btn-black"
              onClick={() => dispatch({ type: "show-add-recipe" })}
            >
              Add a Recipe
            </button>
          </div>
        )}
        {state.showUI === "home-view" && (
          <div id="home-view">
            {state.recipes.length > 0 &&
              state.recipes.map((data) => (
                //console.log(data);
                <RecipeCard key={data.id} data={data} onSelected={showRecipe} />
              ))}
          </div>
        )}

        {state.showUI === "add-recipe-view" && (
          <AddRecipe
            onAdd={(recipe) => {
              fetch("/api/recipes", {
                // fetch("https://localhost:3000/recipes", {
                method: "POST",
                body: JSON.stringify(recipe),
              })
                .then((res) => res.json())
                .then(({ recipe }) => {
                  dispatch({ type: "add-recipe", recipe });
                });
            }}
            onExit={() => dispatch({ type: "exit-add-recipe" })}
          />
        )}

        {state.showUI === "recipe-view" && (
          <Recipe
            recipeId={state.recipeId}
            onExit={() => dispatch({ type: "exit-recipe" })}
          >
            {({
              title,
              description,
              recipeImg,
              keywords,
              ingredients,
              instructions,
              dishType,
            }) => (
              <>
                <img className="recipe-img" src={recipeImg} alt={title} />
                <h1 className="recipe-title">{title}</h1>
                <p className="recipe-desc">{description}</p>
                <Icon type={dishType} />
                <div className="keywords">
                  {keywords.map(({ id, label }) => (
                    <div className="keyword" key={id}>
                      {label.toUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="recipe-ingredients">
                  <h3>INGREDIENTS</h3>
                  <ul>
                    {ingredients.map(({ id, label }) => (
                      <li key={id}>{label}</li>
                    ))}
                  </ul>
                </div>
                <div className="recipe-instructions">
                  <h3>INSTRUCTIONS</h3>
                  <p>{instructions}</p>
                </div>
              </>
            )}
          </Recipe>
        )}
      </div>
    </>
  );
};
export default App;
