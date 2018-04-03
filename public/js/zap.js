const zapEmojisPerStrength = [1, 2, 3, 4, 7]
const emojiArray = {
  angry: ["steaming", "skullandbones", "angry", "stop", "under18", "bomb", "cursing"],
  happy: ["crazy", "surprised", "sunglasses", "muscle", "lol", "okay", "top"],
  sad: ["sad-sweat", "sad", "frowning", "confounded", "nervous", "crying", "disappointed"],
  sassy: ["love-cat", "smirk", "crazy", "love-eyes", "point-right", "okay", "kiss"],
  sick: ["sick", "nausea", "weary", "sneezing", "bandage", "vomiting", "thermometer"],
}
const strengthTitleArray = [
  "Zap força fraca",
  "Zap força média",
  "Isso que é zap bb",
  "Zap monstrão",
  "Zap topper d+"
]
const randomZapArray = [
  "Zapeia esse texto bb que vai ficar top demais",
  "Agora Pabllo Vittar foi longe demais!",
  "A REDE GLOBO VAI TROCAR O CRISTO REDENTOR POR UMA ESTÁTUA DO PABLLO VITTAR"
]

const zapStrengthShow = value => {
  const mood = $(".mood-button.active").data("mood")
  const finalZap = `
    <div class="mb10">${strengthTitleArray[value]}</div>
    ${emojiArray[mood].slice(0, zapEmojisPerStrength[value]).map(
      emoji => `<img class="emoji" src="images/emojis/${emoji}.png" alt="${emoji}"/>`
    ).join(" ")}
  `

  $("#strength-show").html(finalZap)
}

$(window).on("load", () => {
  // Preload images
  $.fn.preload = function() {
    this.each(function(){
        $("<img/>")[0].src = this
    })
  }

  Object.values(emojiArray).forEach(arr => {
    $(arr.map(emoji => `images/emojis/${emoji}.png?v=1.1.0`)).preload()
  })
})

$(() => {
  $('[data-toggle="tooltip"]').tooltip()
  $("#suggest-emoji").emojioneArea()

  $("#strength-slider").on("input change", e => {
    zapStrengthShow(e.target.value)
  })

  $(".mood-button").on("click", function() {
    $(".mood-button").removeClass("active")
    $(this).addClass("active")
    zapStrengthShow($("#strength-slider").val())
  })

  $("#vemdezap").on("click", () => {
    $.LoadingOverlay("show")
  
    const zap = $("#text-box").val() || randomZapArray[Math.floor(Math.random()*randomZapArray.length)]
    const mood = $(".mood-button.active").data("mood")
    const strength = Number($("#strength-slider").val() + 1)

    const rateLenArr = [2, 5, 8, 15, 30, Infinity]
    const rateValArr = [1, 0.95, 0.8, 0.7, 0.5, 0.45]
    const zapTokens = zap.split(" ").length
    let rate
    
    for (let i = 0; i < rateLenArr.length; i++) {
      if (zapTokens < rateLenArr[i]) {
        rate = rateValArr[i]
        break
      }
    }
    rate = rate || 0.5 // just to be safe
    
    let tweet = $('#twitter-check').is(":checked")
    console.log(tweet)
    $.post("/api/v1.0/zap", { zap, mood, strength, rate, tweet }, res => {
      console.log("Texto zapeado com sucesso:", res)
      
      $("#twitter-check").attr("checked", false).hide()
      $("#twitter-label").html("Você pode zapear seu texto novamente para mais emojis!")
      
      $("#text-box").val(res.zap)

      $.LoadingOverlay("hide", true)
      $("#text-box").select()
      // document.execCommand("copy")
      $("#text-box").attr({ "data-toggle": "tooltip", "title": "Copie seu zap!" })
      $("#text-box").tooltip("show")
      setTimeout(() => $("#text-box").tooltip("hide"), 2000)
      setTimeout(() => $("#text-box").tooltip("dispose"), 2500)

      if (res.gemidao) {
        new Audio("audio/gemidao.mp3").play()
      }

      $("#zapshare button").removeClass("hidden")
      $(".collapse").collapse()
    })
  })

  $("#suggest-form").on("submit", e => {
    const word = $("#suggest-word").val()
    let emojis = $("#suggest-emoji").val()

    console.log({ word, emojis })
    $.ajax({
      url: "/api/v1.0/suggest",
      type: "POST",
      data: JSON.stringify({ word, emojis }),
      contentType:"application/json; charset=utf-8",
      // dataType:"json",
      success: () => {
        $(".collapse").collapse("hide")
        setTimeout(() => { $(".suggestion-box").remove() }, 1000)
      }
    })
    
    e.preventDefault()
  })

  $("#zapshare").on("click", function() {
    let zap = $("#text-box").val() + "\n\n Zapeado por http://vemdezapbe.be"
    this.href = `whatsapp://send?text=${encodeURI(zap)}`
  })
})