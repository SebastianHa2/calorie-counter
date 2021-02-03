// Selectors
const table = document.querySelector(".meal-table"), submitBtn = document.getElementById("submit-btn"),
mealName = document.getElementById("meal"), calories = document.getElementById("calories"), allRows = document.querySelectorAll("tr"),
caloriesCounter = document.querySelector(".calorie-counter"), addForm = document.querySelector(".add"),
editForm = document.querySelector(".edit"), mealNameEdit = document.querySelector(".editMeal"),
caloriesEdit = document.querySelector(".editCalories"), editBtn = document.getElementById("edit-btn"),
deleteBtn = document.getElementById("delete-btn"), clearAllBtn = document.getElementById("clear-all")

let numberOfRows = allRows.length

// Item Controller
const ItemController = (function(){
    // Item Constructor
    const Item = function(id, name, calories){
        this.id = id
        this.name = name
        this.calories = calories
    }

    // Data Structure / State 
    const state = {
        items: [],
    }

    return {
        // Getting items from local storage
        getItemsFromLocalStorage: function(){
            if(localStorage.getItem("meals") !== null){
                return state.items = JSON.parse(localStorage.getItem("meals"))
            }else{
                return state.items = []
            }
        },

        // Adding a single item to local storage
        addItemToLocalStorage: function(item){
            let meals
            if(localStorage.getItem("meals") == null){
                meals = []
            }else{
                meals = JSON.parse(localStorage.getItem("meals"))
            }
            meals.push(item)
            localStorage.setItem("meals", JSON.stringify(meals))
        },

        // Creating and adding a new item
        addItem: function(name, calories){
            // Create ID 
            let id
            if(state.items.length > 0){
                // The ID needs to equal +1 of the highest id of the items
                // So when items are deleted there will be no duplication
                id = state.items[state.items.length -1].id + 1
            }else{
                id = 1
            }

            // Calories to number
            calories = parseInt(calories)

            // Creating an instance of the item
            newItem = new Item(id, name, calories)

            // Adding it to the array of items
            state.items.push(newItem)

            // Adding it to local Storage
            this.addItemToLocalStorage(newItem)

            // Notifying the UIController of a new added instance
            this.notifyOfAddition(newItem)


            // Returning the created object for use in the AppController
            return newItem
        },

        updateItem: function(id){
            // Update item info in the array by getting the item we're editing from the 
            // array and changing its properties to the values from the inputs
            let editItem = document.getElementById(`${id}`)
            state.items.forEach(item => {
                if(item.name == editItem.firstElementChild.textContent){
                    let caloriesDifference = parseInt(caloriesEdit.value) - parseInt(item.calories)
                    item.name = mealNameEdit.value
                    item.calories = caloriesEdit.value

                    // Notifying the UIController of changes in the data
                    this.notifyOfEddition(caloriesDifference)

                    // Updating local storage data
                    this.updateLocalStorage()
                }
            })
        },

        deleteItem: function(id){
            // Deleting an item from the array by filtering out all
            // the items that do not equal it back to the state.items array
            let editItem = document.getElementById(`${id}`)
            state.items = state.items.filter(item => {
                return item.name !== editItem.firstElementChild.textContent
            })
            // Getting the calories of the item deleted to pass to the UIController
            let caloriesDifference = editItem.firstElementChild.nextElementSibling.textContent
            caloriesDifference = (-1*parseInt(caloriesDifference))

            // Notifying the UIController of changes in the data
            this.notifyOfEddition(caloriesDifference)

            // Updating local storage data
            this.updateLocalStorage()
        },

        // Simple function for updating local storage data
        updateLocalStorage: function(){
            localStorage.clear()
            localStorage.setItem("meals", JSON.stringify(state.items))
        },

        // Notifiers of changes to the data
        notifyOfAddition: function(newItem){
            UIController.addSingleItem(newItem)
            UIController.updateCalories(newItem.calories)
        },

        notifyOfEddition: function(caloriesDifference){
            UIController.updateCalories(caloriesDifference)
        }

    }
})()


// UI Controller 
const UIController = (function(){
    let totalCalories = 0
    return{
        // Function used for clearing inputs after certain events
        clearInput: function(){
            mealName.value = ''
            calories.value = ''
            
            caloriesEdit.value = ''
            mealNameEdit.value = ''
        },

        // Displaying the items from local storage upon initialization
        populateTable: function(items){
            items.forEach(item => {
                let row = table.insertRow(numberOfRows)
                row.setAttribute("id", `item-${item.id}`)
                let cell1 = row.insertCell(0)
                let cell2 = row.insertCell(1)
                let cell3 = row.insertCell(2)
                cell1.textContent = item.name
                cell2.textContent = item.calories
                cell3.innerHTML = '<i class="fas fa-pen"></i>'
            });
        },

        // Adding a single new item to the table
        addSingleItem: function(item){
            let row = table.insertRow(numberOfRows)
            row.setAttribute("id", `item-${item.id}`)
            let cell1 = row.insertCell(0)
            let cell2 = row.insertCell(1)
            let cell3 = row.insertCell(2)
            cell1.textContent = item.name
            cell2.textContent = item.calories
            cell3.innerHTML = '<i class="fas fa-pen"></i>'
            UIController.clearInput()
        },

        // Updating the single item by grabbing the row container and updating 
        // the texContents of its children to the values gotten from the edit input
        updateSingleItem: function(id){
            let editItem = document.getElementById(`${id}`)
            editItem.firstElementChild.textContent = mealNameEdit.value
            editItem.firstElementChild.nextElementSibling.textContent = caloriesEdit.value
        },

        // Deleting single item from the table by simply removing the container row
        deleteSingleItem: function(id){
            let editItem = document.getElementById(`${id}`)
            editItem.parentElement.removeChild(editItem)
        },
    
        // Adding up the calories on initialization and displays them
        addUpCalories: function(items){
            items.forEach(item => {
                totalCalories += parseInt(item.calories)
            })
            
            caloriesCounter.textContent = `Total Calories: ${totalCalories}`
            return totalCalories
        },

        // Updating and displaying calories after deletion or edition of items
        updateCalories: function(calories){
            totalCalories += calories
            caloriesCounter.textContent = `Total Calories: ${totalCalories}`
        }


    }
})()


// App Controller 
const App = (function(ItemController, UIController){
    // Add item function
    const addItem = function(e){
        if(mealName.value !== '' && calories.value !== ''){
            // Add item // The addItem method will then return the created object for use here
            const newItem = ItemController.addItem(mealName.value, calories.value)
        }
        e.preventDefault()
        e.stopImmediatePropagation()
    }

    let id

    const changeToEdit = function(e){
        let target = e.target
        if(target.classList.contains("fas")){
            // Hide addition form and show edit form
            addForm.style.display = "none"
            editForm.style.display = "block"

            // Get the name and calories and place them in input field for edit
            let nameToEdit = target.parentElement.previousElementSibling.previousElementSibling.textContent
            let caloriesToEdit = target.parentElement.previousElementSibling.textContent
            mealNameEdit.value = nameToEdit
            caloriesEdit.value = caloriesToEdit

            // Gets id of the item to edit
            // IF I console log the id here, before the editBtn click event
            // It is the correct id
            id = target.parentElement.parentElement.getAttribute("id")
        }  
        
        e.stopImmediatePropagation()
    }


    const clearAll = function(){
        localStorage.clear()
        document.querySelector("tbody").innerHTML = ''
        caloriesCounter.textContent = `Total Calories: 0`

    }

    // Delete item event
    deleteBtn.addEventListener("click", (e) => {
        ItemController.deleteItem(id)
        UIController.deleteSingleItem(id)
        UIController.clearInput()
        
        // Hide the edit form and show the addition form again
        addForm.style.display = "block"
        editForm.style.display = "none"

        e.stopImmediatePropagation()

    })

    // Edit item event
    editBtn.addEventListener("click", (e) => {
        // When I console log it here it gives the wrong id, of the item before or after it
        ItemController.updateItem(id)
        UIController.updateSingleItem(id)
        UIController.clearInput()
        
        // Hide the edit form and show the addition form again
        addForm.style.display = "block"
        editForm.style.display = "none"

        e.stopImmediatePropagation()

    })
    
    //Clear all items and local storage event
    clearAllBtn.addEventListener("click", clearAll)

    // Add item event
    submitBtn.addEventListener("click", addItem)
    
    // Change to edit event
    table.addEventListener("click", changeToEdit)

    // Create an init method to initialize the application
    return{
        init: function(){
            console.log("Initializing app")

            // Loading the items from local storage on initialization
            const items = ItemController.getItemsFromLocalStorage()

            // Filling the table with the data from local storage
            UIController.populateTable(items)

            //  Adding up and displaying calories
            UIController.addUpCalories(items)
        }
    }
})(ItemController, UIController)

App.init()




