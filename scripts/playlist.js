window.onload = () => {
  let audiosArray = [
    "./assets/audio/Ivan_Boyarkin-Last_Time_(feat._Denis_Nazarov).mp3",
    "./assets/audio/Ivan_Boyarkin-Leave_Me_Alone_(feat._Gayana).mp3",
    "./assets/audio/Ivan_Boyarkin-Resistance.mp3",
    "./assets/audio/Ivan_Boyarkin-Something_In_My_Mind_(demo).mp3",
    "./assets/audio/Ivan_Boyarkin-Wasteland_(feat._Vladimir_Lebedev).mp3",
    "./assets/audio/Ivan_Boyarkin-Whatever_You_Want_(feat._A._Chevajevskaya_and_S._Velichko).mp3",
  ];
  let audios = audiosArray;
  let audio = new Audio();
  let currentAudio = 0;
  let fillBar = document.getElementById("line_current_time_position");
  let duration = 0;
  let currentTime = 0;
  let currentVolume = 0.2;
  let valueSearcher = "";

  audio.setAttribute("id", "audio");
  audio.src = audios[currentAudio];
  audio.load();

  setAudioInDom(audiosArray); // создаём плейлист в виде DOM элементов
  durationInit(); // добавляем duration в DOM
  volumeInit(currentVolume); // отрисовка громкости звука браузера
  setOnClickButtonSetAudio(); // вешаем обработчики на кнопки выбора аудио
  setOnClickButtonControl(); // вешаем обработчики на кнопки управления
  addOnButtonEventListener(); // добавляем слушатели
  pushUnpushButtons(String(currentAudio), []); // выбираем первый трек

  // вешаем обработчики на кнопки выбора аудио
  function setOnClickButtonSetAudio() {
    let audioLinks = document.querySelectorAll("button.btnAudioSelection");
    for (let i = 0; i < audioLinks.length; i++) {
      audioLinks[i].onclick = () => {
        setTimeInDom(audio.duration);
        setAudio(audios);
      };
    }
  }
  // вешаем обработчики на кнопки управления
  function setOnClickButtonControl() {
    document.getElementById("prev").onclick = () => {
      setTimeInDom(audio.duration);
      prevAudio();
    };
    document.getElementById("play").onclick = playAudio;
    document.getElementById("next").onclick = () => {
      setTimeInDom(audio.duration);
      nextAudio();
    };
    document.getElementById("mute").onclick = muteAudio;
    document.getElementById("volume").onclick = () => {
      volumeInit(Number(event.offsetX) / 100);
    };
    document.getElementById("line_current_time").onclick = () => {
      currentTimeInit(Number(event.offsetX));
    };
    document.getElementById("input_searcher").oninput = () => {
      valueSearcher = event.target.value;
      if (valueSearcher.length >= 3 && valueSearcher.length <= 20) {
        setAudioInDom(searching(valueSearcher));
        durationInit();
      } else {
        audios = audiosArray;
        setAudioInDom(audios);
        durationInit();
      }
    };
  }
  // для строки поиска
  function searching(value) {
    audios = [];
    for (let i = 0; i < audiosArray.length; i++) {
      if (audiosArray[i].search(new RegExp(value, "i")) != -1) {
        audios.push(audiosArray[i]);
      }
    }
    return audios;
  }
  // отрисовка громкости звука браузера
  function volumeInit(currentVolume) {
    audio.volume = currentVolume;
    document.getElementById("volume_position").style.width =
      currentVolume * 100 + "%";
  }
  // для выбора с какого места прослушивать
  function currentTimeInit(positionX) {
    audio.currentTime =
      (duration * positionX) /
      document.getElementById("box_current_time").offsetWidth;
  }
  // добавляем слушатели
  function addOnButtonEventListener() {
    audio.addEventListener("loadedmetadata", () => {
      duration = audio.duration;
    });
    audio.addEventListener("timeupdate", () => {
      currentTime = audio.currentTime;
      setTimeInDom(currentTime);
      let position = (currentTime / duration) * 100;
      fillBar.style.width = position + "%";
      if (duration > 0) {
        for (let i = 0; i < audio.buffered.length; i++) {
          if (
            audio.buffered.start(audio.buffered.length - 1 - i) <
            audio.currentTime
          ) {
            let widthLine =
              (audio.buffered.end(audio.buffered.length - 1 - i) / duration) *
              100;
            document.getElementById("line_current_time_buffered").style.width =
              widthLine + "%";
            break;
          }
        }
      }
    });
    audio.addEventListener("error", errorHandler, false);
    audio.addEventListener(
      "ended",
      () => {
        setTimeInDom(audio.duration);
        nextAudio();
      },
      false
    );
  }
  // добавляем обработчики событий нажатия клавиш на панели управления
  function prevAudio() {
    pushUnpushButtons("prev", []);
    setTimeout(() => {
      pushUnpushButtons("", ["prev"]);
    }, 100);

    let currentAudio = getId();
    let arrayId = [];
    currentAudio--;
    if (currentAudio < 0) {
      currentAudio = audios.length - 1;
    }
    audio.src = audios[currentAudio];
    for (let i = 0; i < audios.length; i++) {
      if (currentAudio != i) {
        arrayId.push(i);
      }
    }
    pushUnpushButtons(currentAudio ? currentAudio : "0", arrayId);
    pushUnpushButtons("play", []);
    audio.play();
  }
  function playAudio() {
    if (!isButtonPushed("play")) {
      pushUnpushButtons("play", []);
      audio.play();
    } else {
      pushUnpushButtons("", ["play"]);
      audio.pause();
    }
  }
  function nextAudio() {
    pushUnpushButtons("next", []);
    setTimeout(() => {
      pushUnpushButtons("", ["next"]);
    }, 100);
    let currentAudio = getId();
    let arrayId = [];

    currentAudio++;
    if (currentAudio >= audios.length) {
      currentAudio = 0;
    }
    audio.src = audios[currentAudio];
    for (let i = 0; i < audios.length; i++) {
      if (currentAudio != i) {
        arrayId.push(i);
      }
    }
    pushUnpushButtons(currentAudio ? currentAudio : "0", arrayId);
    pushUnpushButtons("play", []);
    audio.play();
  }
  // для обработки нажатия на кнопку MUTE
  function muteAudio() {
    if (!isButtonPushed("mute")) {
      pushUnpushButtons("mute", []);
    } else {
      pushUnpushButtons("", ["mute"]);
    }
    audio.muted = !audio.muted;
  }
  // поиск текущего трека по ID
  function getId() {
    for (let i = 0; i < document.querySelectorAll("button").length; i++) {
      if (
        document.querySelectorAll("button")[i].className.indexOf("selected") !==
        -1
      ) {
        return i;
      }
    }
  }
  // функция обработки выбора аудио
  function setAudio(audios) {
    let currentAudio = event.target.closest("button").getAttribute("id");
    let arrayId = [];
    audio.src = audios[currentAudio];
    for (let i = 0; i < audios.length; i++) {
      if (currentAudio != i) {
        arrayId.push(i);
      }
    }
    pushUnpushButtons(currentAudio, arrayId);
    pushUnpushButtons("play", []);
    audio.play();
  }
  // визуальная обработка нажатия кнопок
  function pushUnpushButtons(idToPush, idArrayToUnpush) {
    if (idToPush != "") {
      let anchor = document.getElementById(idToPush);
      let theClass = anchor.getAttribute("class");
      if (theClass.indexOf("selected") === -1) {
        theClass = theClass.replace("unSelected", "selected");
        anchor.setAttribute("class", theClass);
      }
    }
    // в остальных элементах находим класс "selected" и убираем его
    for (let i = 0; i < idArrayToUnpush.length; i++) {
      anchor = document.getElementById(idArrayToUnpush[i]);
      theClass = anchor.getAttribute("class");
      if (theClass.indexOf("selected") !== -1) {
        theClass = theClass.replace("selected", "unSelected");
        anchor.setAttribute("class", theClass);
      }
    }
  }
  // выясяем нажата ли кнопка или нет
  function isButtonPushed(id) {
    let anchor = document.getElementById(id);
    let theClass = anchor.getAttribute("class");

    if (theClass.indexOf("selected") !== -1) {
      return true;
    } else {
      return false;
    }
  }
  // создаём плейлист в виде DOM элементов
  function setAudioInDom(audios) {
    let boxAudio = document.getElementById("boxAudioSelection");
    boxAudio.innerHTML = "";
    for (let i = 0; i < audios.length; i++) {
      let btnElement = document.createElement("button");
      btnElement.className = "btnAudioSelection unSelected";
      btnElement.setAttribute("id", i);

      let spanArtist = document.createElement("span");
      spanArtist.setAttribute("class", "artist");

      let spanTitle = document.createElement("span");
      spanTitle.setAttribute("class", "title");

      spanArtist.innerText = audios[i].slice(
        audios[i].lastIndexOf("/") + 1,
        audios[i].indexOf("-") - 1
      );
      spanTitle.innerText = audios[i].slice(
        audios[i].indexOf("-") + 1,
        audios[i].length
      );

      let spanDuration = document.createElement("span");
      spanDuration.setAttribute("class", "duration");

      let spanCurrentTime = document.createElement("span");
      spanCurrentTime.setAttribute("class", "currentTime");

      btnElement.append(spanArtist);
      btnElement.append(spanTitle);
      btnElement.append(spanDuration);
      boxAudio.append(btnElement);
    }
    setOnClickButtonSetAudio();
  }
  // добавляем duration в DOM
  function durationInit() {
    for (let i = 0; i < audios.length; i++) {
      let a = new Audio();
      a.src = audios[i];
      a.addEventListener("loadedmetadata", () => {
        document.getElementById(i).querySelector(".duration").innerText =
          Math.floor(a.duration / 60) +
          ":" +
          (a.duration % 60 < 10 ? "0" : "") +
          Math.floor(a.duration % 60);
      });
    }
  }
  // добавляем необходимое время в столбец DURATION
  function setTimeInDom(time) {
    i = getId();
    if (document.getElementById(i)) {
      document.getElementById(i).querySelector(".duration").innerText =
        Math.floor(time / 60) +
        ":" +
        (time % 60 < 10 ? "0" : "") +
        Math.floor(time % 60);
    }
  }
  // отлавливаем ошибки
  function errorHandler() {
    let audio = document.getElementByld("audio");
    if (audio.error) {
      console.log(audio.error.code);
      nextAudio();
    }
  }
};
