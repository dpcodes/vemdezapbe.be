const tokens = require("./db/tokens.js")
const utils = require("./utils.js")

const isInvalidToken = token => {
  return tokens.discardTokens.join(" ").match(token) || token.match(utils.emojiParseRegEx)
}

const fullMatchToken = token => Object.keys(tokens.matchTokens.fullMatch).includes(token)

const fullAccentMatchToken = token => utils.hasAccent(token) && Object.keys(tokens.matchTokens.accentMatch).includes(token)

const getTokenMatch = (isFullMatch, isFullAccentMatch, token) => {
  if (isFullAccentMatch) {
    return tokens.matchTokens.accentMatch[token]
  } else {
    token = utils.removeAccent(token)
  }

  if (isFullMatch) {
    return tokens.matchTokens.fullMatch[token]
  }

  let match

  const any = tokens.matchTokens.partialMatch.any
  const matchesAny = Object.keys(any).some(t => {
    if (new RegExp(`\\w*${t}\\w*`, "iu").test(token)) {
      match = t
      return true
    }
  })

  if (matchesAny) {
    return any[match]
  } 

  const prefix = tokens.matchTokens.partialMatch.prefix
  const matchesPrefix = Object.keys(prefix).some(t => {
    if (new RegExp(`^${t}\\w*`, "iu").test(token)) {
      match = t
      return true
    }
  })

  if (matchesPrefix) {
    return prefix[match]
  }

  return false
}

const zapinate = ({ zap, mood = "happy", rate = 0.5, strength = 3, toUpper = false }) => {
  if (Number.isInteger(strength)) {
    strength = strength > 5 ? 5 : strength
    strength = [Math.floor(strength/2), strength]
  } else {
    strength = [1, 3]
  }

  let zapinated = ""

  zap.split("\n").forEach(line => {
    line.replace(/\s+/g, " ").split(" ").forEach(token => {
      const originalToken = token
      token = utils.cleanToken(token.toLowerCase())

      const isFullAccentMatch = fullAccentMatchToken(token)
      const isFullMatch = !isFullAccentMatch && fullMatchToken(utils.removeAccent(token))

      if (!isFullMatch && !isFullAccentMatch && (token.length <= 2 || isInvalidToken(token))) {
        zapinated += `${originalToken} `
        return
      }

      if (Math.random() < rate) {
        let zapStrength = strength[Math.round(Math.random())]
        let possibleEmojis = getTokenMatch(isFullMatch, isFullAccentMatch, token) || tokens.moodEmojis[mood]
        let chosenEmojis = utils.choices(possibleEmojis, zapStrength)
        zapinated += `${originalToken} ${chosenEmojis.join("")} `
      } else {
        zapinated += `${originalToken} `
      }
    })
    zapinated += "\n"
  })

  if (toUpper) {
    zapinated = zapinated.toUpperCase()
  }

  return zapinated.trim()
}

module.exports = {
  zapinate,
}