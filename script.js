import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZ2wAuVFuP2WfUt-2cPZ7IydXxCX-j1es",
  authDomain: "moyka-city-640c4.firebaseapp.com",
  databaseURL: "https://moyka-city-640c4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "moyka-city-640c4",
  storageBucket: "moyka-city-640c4.firebasestorage.app",
  messagingSenderId: "271622311789",
  appId: "1:271622311789:web:7d0b54a2ea4c4eb08f9464" };


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const phoneInput = document.getElementById('phoneInput');
const checkBtn = document.getElementById('checkBtn');
const addWashBtn = document.getElementById('addWashBtn');
const resultsArea = document.getElementById('resultsArea');
const errorMessage = document.getElementById('errorMessage');
const progressSteps = document.querySelectorAll('.progress-step');

let currentPhone = "";

function updateProgressBar(count) {
  let displayCount = count % 5;
  if (count > 0 && count % 5 === 0) displayCount = 5;

  progressSteps.forEach(step => {
    step.classList.remove('active');
    const stepNumber = parseInt(step.dataset.step);
    if (stepNumber <= displayCount) {
      step.classList.add('active');
    }
  });
}

checkBtn.onclick = async () => {
  currentPhone = phoneInput.value.trim();
  if (currentPhone.length < 10) {
    errorMessage.textContent = "Введіть коректний номер!";
    return;
  }

  try {
    const userRef = doc(db, "clients", currentPhone);
    const userSnap = await getDoc(userRef);

    let count = 0;
    if (userSnap.exists()) {
      count = userSnap.data().washes;
    } else {
      await setDoc(userRef, { washes: 0 });
    }

    updateProgressBar(count);
    resultsArea.classList.remove('hidden');
    errorMessage.textContent = "";
    resultsArea.scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    console.error("Firebase Error:", e);
    errorMessage.textContent = "Помилка! Перевір консоль (F12)";
  }
};

addWashBtn.onclick = async () => {
  if (!currentPhone) {
    Swal.fire('Помилка', 'Спочатку введіть номер', 'error');
    return;
  }

  const { value: password } = await Swal.fire({
    title: 'Пароль адміна',
    input: 'password',
    inputPlaceholder: 'Введіть пароль',
    showCancelButton: true });


  if (password === "1854") {
    try {
      const userRef = doc(db, "clients", currentPhone);
      const userSnap = await getDoc(userRef);
      let currentWashes = userSnap.exists() ? userSnap.data().washes : 0;

      let nextValue = currentWashes >= 5 ? 1 : currentWashes + 1;

      await setDoc(userRef, { washes: nextValue }, { merge: true });
      updateProgressBar(nextValue);
      Swal.fire('Готово!', 'Мийку додано', 'success');
    } catch (e) {
      Swal.fire('Помилка', 'Не вдалося зберегти дані', 'error');
    }
  } else if (password) {
    Swal.fire('Помилка', 'Невірний пароль', 'error');
  }
};