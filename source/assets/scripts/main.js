// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.3.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-auth.js'
import { getFirestore, collection, addDoc, query, where, getDocs, getDoc, updateDoc, arrayUnion, doc, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-firestore.js'


// Here is where the recipes that you will fetch.
// Feel free to add your own here for part 2, if they are local files simply add their path as a string.
const firebaseConfig = {
  apiKey: "AIzaSyCwaLuRVV073aNbTB5EaLoZDIFXGzvqr3A",
  authDomain: "easy-chef-3eb03.firebaseapp.com",
  projectId: "easy-chef-3eb03",
  storageBucket: "easy-chef-3eb03.appspot.com",
  messagingSenderId: "744097831580",
  appId: "1:744097831580:web:ef9a05d277c2b1785b2b59",
  measurementId: "G-JKV8H3SLTR"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// UNCOMMENT THE 2 BELOW LINES WHEN BUTTONS ARE CONNECTED TO SIGNIN AND SIGNUP

// document.querySelector('#signUp').addEventListener('click', signUp);
// document.querySelector('#signIn').addEventListener('click', signIn);
/**
 * Signup function that creates new user and returns the user id
 */
async function signUp() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var user_id;
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    user_id = user.uid;
    addUser(email, user.uid);
    const userInformation = getUser(user.uid);
    console.log(userInformation);
    return userInformation;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}

/**
 * Sign in function that returns a user ID
 */
async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log(email);
  console.log(password);
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // UID specifies which user we are talking about
      const userInformation = getUser(user.uid);
      return userInformation;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

/**
 * addUser function that adds a user to the FireStore Database after creating an account
 * @param {string} email 
 * @param {string} id 
 */
async function addUser(email, id) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      user_email: email,
      user_id: id,
      favoriteRecipes: [],
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


// DELETE COMMENT WHEN DONE! ADD PARAMETERS!!
/**
 * 
 * @param {id of user logged in} id 
 * @param {name of recipe} name
 * @param {Time it takes to cook the meal} time 
 * @param {Cost of ingredients in the meal} cost 
 * @param {Number of servings in the meal} servings 
 * @param {Information regarding the meal} description 
 * @param {Image of meal} image
 * @param {tag of meal} tag
 */
 async function createRecipe(name, time, cost, servings, description) {
   let id = "D3TKWTnCklTvt5dWDNPlLbUQYa53"
  const q = query(collection(db, "users"), where("user_id", "==", id));
  const querySnapshot = await getDocs(q);
  const document = querySnapshot.docs[0];
  console.log(document.id)
  console.log(document)
  const database = doc(db, "users", document.id);
  // console.log(document.data())
    await updateDoc(database, {
      favoriteRecipes: arrayUnion({name: name, time: time, cost: cost, servings: servings, description: description})
    })
}

async function removeRecipe() {
  let id = "D3TKWTnCklTvt5dWDNPlLbUQYa53"
  const q = query(collection(db, "users"), where("user_id", "==", id));
  const querySnapshot = await getDocs(q);
  const document = querySnapshot.docs[0];
  console.log(document.id)
  console.log(document)
  let name = "pizza";
  let time = "30";
  let cost = "40";
  let servings = "3";
  let description = "testing";
  const database = doc(db, "users", document.id);
  // console.log(document.data())
    await updateDoc(database, {
      favoriteRecipes: arrayRemove({name: "pizza"})
    })
}

//document.querySelector('#tester').addEventListener('click', removeRecipe)

/**
 * Returns the information of a signed user such as favorite recipes, email, ID
 * @param {String} id 
 * @returns information regarding the user
 */
 async function getUser() {
  let id = "D3TKWTnCklTvt5dWDNPlLbUQYa53"

  const userInformation = {};
  const users = collection(db, "users");
  const q = await query(users, where("user_id", "==", id));
  const querySnapshot = await getDocs(q);
  const createdRecipes = [];
  querySnapshot.forEach((doc) => {
    userInformation["results"] = doc.data();
  });
  for(let i = 0; i<userInformation.results.favoriteRecipes.length; i+=1) {
    createdRecipes.push( await getRecipe(userInformation.results.favoriteRecipes[i]));
  }
  userInformation.results.recipes = createdRecipes
  console.log(userInformation);
  return userInformation;
}

//********************************************************************
/* main.js STARTS HERE */
//*********************************************************************
//Get users' favorite recipes
const user = await getUser();
console.log(user)

const recipes = user["results"].recipes;

  let numRecipes;
  
  // Once all of the recipes that were specified above have been fetched, their
  // data will be added to this object below. You may use whatever you like for the
  // keys as long as it's unique, one suggestion might but the URL itself
  const recipeData = {}
  
  //Call this to begin getting recipe cards
  init();
  
  // This is the first function to be called, so when you are tracing your code start here.
  async function init() {
    // fetch the recipes and wait for them to load
    let fetchSuccessful = await fetchRecipes();
    // if they didn't successfully load, quit the function
    if (!fetchSuccessful) {
      console.log('Recipe fetch unsuccessful');
      return;
    };
    // Add the first three recipe cards to the page
    createRecipeCards();
    // Make the "Show more" button functional
    bindShowMore();
  }
  async function fetchRecipes() {
    return new Promise((resolve, reject) => {
      // This function is called for you up above
      // From this function, you are going to fetch each of the recipes in the 'recipes' array above.
      // Once you have that data, store it in the 'recipeData' object. You can use whatever you like
      // for the keys. Once everything in the array has been successfully fetched, call the resolve(true)
      // callback function to resolve this promise. If there's any error fetching any of the items, call
      // the reject(false) function.
  
      // For part 2 - note that you can fetch local files as well, so store any JSON files you'd like to fetch
      // in the recipes folder and fetch them from there. You'll need to add their paths to the recipes array.
  
      // Part 1 Expose - TODO
        numRecipes = recipes.length;

        console.log(recipes);
        //Parse recipes from JSON to recipeData
        for(let i = 0; i < numRecipes; ++i){
          recipeData[i] = recipes[i];
          if(i == numRecipes - 1){
            resolve(true);
          }
        }
    });
  }
  
  function createRecipeCards() {
    // This function is called for you up above.
    // From within this function you can access the recipe data from the JSON 
    // files with the recipeData Object above. Make sure you only display the 
    // three recipes we give you, you'll use the bindShowMore() function to
    // show any others you've added when the user clicks on the "Show more" button.
  
    // Part 1 Expose - TODO
    for(let i = 0; i < numRecipes; ++i){
      let recipeCard = document.createElement("recipe-card");
      recipeCard.data = recipeData[i.toString()];
      let mainElement = document.querySelector("main");
      mainElement.appendChild(recipeCard);
    }
  
  }
  
  function bindShowMore() {
    // This function is also called for you up above.
    // Use this to add the event listener to the "Show more" button, from within 
    // that listener you can then create recipe cards for the rest of the .json files
    // that were fetched. You should fetch every recipe in the beginning, whether you
    // display it or not, so you don't need to fetch them again. Simply access them
    // in the recipeData object where you stored them/
  
    // Part 2 Explore - TODO
  }

    /**
   * Recursively search for a key nested somewhere inside an object
   * @param {Object} object the object with which you'd like to search
   * @param {String} key the key that you are looking for in the object
   * @returns {*} the value of the found key
   */
     function searchForKey(object, key) {
      var value;
      Object.keys(object).some(function (k) {
        if (k === key) {
          value = object[k];
          return true;
        }
        if (object[k] && typeof object[k] === 'object') {
          value = searchForKey(object[k], key);
          return value !== undefined;
        }
      });
      return value;
    }




// document.querySelector('#add').addEventListener('click', getUser)
