"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//these both were add manully to the html ( we can do it better using closest)
// const inputCycle = document.querySelector(".form__change__cycle");
// const inputRun = document.querySelector(".form__change__run");
//declaring mapEvent and map in the global so we can use them anywhere
class Workout {
  clicks = 0;
  date = new Date();
  id = (Date.now() + "").slice(-10);

  setTime = `${this.date.getDate()} ${months[this.date.getMonth()]}`;

  constructor(coords, distance, duration) {
    this.corrds = coords;
    this.distance = distance;
    this.duration = duration;
  }
  //
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, caedence) {
    super(coords, distance, duration);
    this.caedence = caedence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}
// const run1 = new running([30, 10], 100, 50, 300);
// const cycle1 = new cycling([20, 10], 50, 100, 400);

class App {
  inputEdit = true;
  #markerArray = [];
  #workoutElemnts = [];
  workouts;
  #workoutArray = [];
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElvationField);
    containerWorkouts.addEventListener("click", this._placeMap.bind(this));

    // this._getLocalStorage();
    deleteButton.addEventListener("click", this._deleteAll.bind(this));
    // this._getLocalStorage();
  }
  getworkoutArray() {
    return this.#workoutArray;
  }
  //++++++
  _getPosition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
      alert("could not take your poisition")
    );
  }
  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on("click", this._showForm.bind(this));
    this.#workoutArray.forEach((work) => {
      this.renderMarker(work);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _toggleElvationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    //Helper Functions

    const validNumbers = function (...numbers) {
      return numbers.every((num) => Number.isFinite(num));
    };
    const positveNumber = function (...numbers) {
      return numbers.every((num) => num > 0);
    };
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const workoutCorrds = [lat, lng];
    //valdiaton

    //1- get Data from the Form(what we mean by data here is just to get each insereted Data)
    const type = inputType.value;
    const distance = +inputDistance.value; //(+ for converting it into numbers)
    const duration = +inputDuration.value;
    let workout;
    //2-cheack if the Data are valid(validiation)

    //3-if Workout is running , we create an running Object
    if (type === "running") {
      const caedence = +inputCadence.value;
      //   if (!(distance > 0 && duration > 0 && caedence > 0))
      //     return alert("Inputs must be positive values");
      if (!positveNumber(distance, duration, caedence))
        return alert(" Numbers must be Positive");
      //now creating an running Object
      workout = new Running(workoutCorrds, distance, duration, caedence);
      this.#workoutArray.push(workout);
    }
    //4- if Workout is Cycling , we create an Cycling Object
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (!validNumbers(elevation) || !positveNumber(duration, distance))
        return alert(" Numbers must be Positive");
      //   if (!(distance > 0 && duration > 0 && elevation > 0))
      //     return alert("Inputs must be positive values");
      workout = new cycling(workoutCorrds, distance, duration, elevation);
      //5-we add each time a new object in an workoutsArray
      this.#workoutArray.push(workout);
    }

    //6-Render Workout on the Map as a Marker
    this.renderMarker(workout);

    //rednerworkouts on the screen
    this.rednerWorkout(workout);
    //clear the form after submitting
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";
    this.setLocaleStorage();
    form.style.display = "none";
    //7- then we clear the form so can the use make a new input
    //hide the form

    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);

    deleteButton.classList.remove("btn__hidden");
    this.workouts = document.querySelector(".workout");
    this.#workoutElemnts.push(this.workouts);
  }

  renderMarker(workout) {
    const marker = L.marker(workout.corrds)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          closeOnClick: false,
          className: `${workout.type}-popup`,
          autoClose: false,
          maxWidth: 250,
          minWidth: 100,
        })
      )
      .setPopupContent(
        ` ${workout.type === "running" ? "🏃‍♂️ Running on" : "🚴‍♀️ cycling on"}  ${
          workout.setTime
        }`
      )
      .openPopup();
    this.#markerArray.push(marker);
  }
  _renderHtml(workout) {
    const html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
      <h2 class="workout__title">${workout.type[0].toUpperCase()}${workout.type.slice(
      1,
      workout.type.length
    )} on ${workout.setTime}<span class="workout__edit" data-id="${
      workout.id
    }">✏️</span></h2>
     
      <div class="workout__details">
      
        <span class="workout__icon">${
          workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${
          workout.type === "running"
            ? workout.pace.toFixed(1)
            : workout.speed.toFixed(1)
        }</span>
        <span class="workout__unit"> ${
          workout.type === "running" ? "min/km" : "km/h"
        }</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === "running" ? "🦶🏼" : "⛰"
        }</span>
        <span class="workout__value">${
          workout.type === "running" ? workout.caedence : workout.elevation
        }</span>
        <span class="workout__unit">${
          workout.type === "running" ? "spm" : "m"
        }</span>
      </div>
    </li>`;
    return html;
  }
  rednerWorkout(workout) {
    const html = this._renderHtml(workout);
    form.insertAdjacentHTML("afterend", html);
  }

  _removemarker(workout) {
    const workoutMarker = this.#workoutArray.find((work) => {
      return work.id === workout.dataset.id;
    });

    this.#markerArray.map((marker) => marker.remove());
  }
  _placeMap(e) {
    const clicked = e.target.closest(".workout");
    const edit = e.target.closest(".workout__edit");

    if (!clicked && !edit && this.inputEdit) return;
    const workout = this.#workoutArray.find(
      (workout) => edit.dataset.id === workout.id
    );

    const changedElemnt = this.#workoutElemnts.find(
      (workout) => edit.dataset.id === workout.dataset.id
    );
    //prettier-ignore
    changedElemnt.innerHTML = `  <li class="workout workout--${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️" }" data-id="${
        workout.id
      }">
    <h2 class="workout__title">
      <span class="cheackbox__hidden"
        ><input type="checkbox" id="delete"
      /></span>
      ${workout.type[0].toUpperCase()}${workout.type.slice(
        1,
        workout.type.length
      )}<span class="workout__edit">✏️</span>
    </h2>
    <form action="">
      <div class="workout__details">
        <label class="workout__icon">${
            workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
          }</label>
        <input class="edit__input" type="text" placeholder="${workout.distance}" />
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <label class="workout__icon">⏱</label>
        <input class="edit__input" type="text" placeholder="${workout.duration}" />

        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <label class="workout__icon">⚡️</label>
        <input class="edit__input" type="text" placeholder="${
            workout.type === "running"
              ? workout.pace.toFixed(1)
              : workout.speed.toFixed(1)
          }" />
        <span class="workout__unit">${
            workout.type === "running" ? "min/km" : "km/h"
          }</span>
      </div>
      <div class="workout__details">
        <label class="workout__icon">${
            workout.type === "running" ? "🦶🏼" : "⛰"
          }</label>
        <input class="edit__input" type="text" placeholder="${
            workout.type === "running" ? workout.caedence : workout.elevation
          }" />
        <span class="workout__unit">${
            workout.type === "running" ? "spm" : "m"
          }</span>
      </div>
    </form>
  </li>`;
    this.inputEdit = containerWorkouts.querySelector(".edit__input");
    //prettier-ignore

    if (edit) return;
    const toMovePlace = this.#workoutArray.find(
      (workout) => workout.id === clicked.dataset.id
    );

    // L.map("map").setView(toMovePlace.coords, 13);
    this.#map.setView(toMovePlace.corrds, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // toMovePlace.click();
  }
  setLocaleStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workoutArray));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;
    deleteButton.classList.remove("btn__hidden");
    this.#workoutArray = data;

    this.#workoutArray.forEach((work) => {
      this.rednerWorkout(work);
      //   this.renderMarker(work);
    });
  }
}

const app = new App();
