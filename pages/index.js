import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const title = "The Cooking Robot";

  const [displayList, setDisplayList] = useState([]);
  const [cookableList, setCookableList] = useState([]);
  const [location, setLocation] = useState(null);
  const [needGroceries, setNeedGroceries] = useState(false);

  const findCookableRecipes = async () => {
    const {
      data: { fridge },
    } = await axios.get("/api/fridge");
    const {
      data: { pantry },
    } = await axios.get("/api/pantry");
    const {
      data: { recipes },
    } = await axios.get("/api/recipes");

    setCookableList(
      recipes.filter((recipe) =>
        Object.keys(recipe.ingredients).every(
          (ingredient) =>
            !!fridge.filter(
              (item) =>
                item.name === ingredient &&
                item.qty >= recipe.ingredients[ingredient]
            ).length ||
            !!pantry.filter(
              (item) =>
                item.name === ingredient &&
                item.qty >= recipe.ingredients[ingredient]
            ).length
        )
      )
    );
  };

  const handleReset = () => {
    setCookableList([]);
    setDisplayList([]);
    setLocation(null);
    setNeedGroceries(false);
  };

  const fetchDisplayData = async ({ destination, apiAddress }) => {
    setLocation(destination);
    const { data } = await axios.get(apiAddress);
    const items = (await destination) === "fridge" ? data.fridge : data.pantry;
    setDisplayList(items);
  };

  useEffect(() => {
    cookableList.length > 0 && setNeedGroceries(true);
  }, [cookableList]);

  return (
    <div>
      {/* heading */}
      <h2 className="text-center">{title}</h2>

      {/* command buttons */}
      <div className="buttonContainer">
        <button
          onClick={() =>
            fetchDisplayData({
              apiAddress: "/api/fridge",
              destination: "fridge",
            })
          }
        >
          {"What's in the fridge?"}
        </button>
        <button
          onClick={() =>
            fetchDisplayData({
              destination: "pantry",
              apiAddress: "/api/pantry",
            })
          }
        >
          {"What's in the pantry?"}
        </button>
        <button onClick={findCookableRecipes}>{"What can I cook?"}</button>
        <button onClick={handleReset}>{"Reset"}</button>
      </div>

      <br />

      {/* display item list */}
      {location !== null && (
        <p className="text-center">{`The following items are in the ${location}: `}</p>
      )}
      <ul className="itemList">
        {displayList.length
          ? displayList?.map((item) => (
              <li className="itemListItem" key={item.id}>
                <span>{item.name}</span>
                <span>{"(" + item.qty + ")"}</span>
              </li>
            ))
          : "No data"}
      </ul>

      {/* cookable recipes list */}
      <p className="text-center">You can cook: </p>
      <ul className="itemList cookList">
        {cookableList.length
          ? cookableList?.map((item) => (
              <li className="itemListItem" key={item.id}>
                <span>{item.name}</span>
              </li>
            ))
          : "No data"}
      </ul>

      {/* confirm grocery shopping */}
      {needGroceries && (
        <>
          <h4 className="text-center">Need to go for grocery shopping?</h4>
          <div className="text-center buttonContainer shoppingButtons">
            <button>Yes</button>
            <button>No</button>
          </div>
        </>
      )}
    </div>
  );
}
