import React, { useReducer, useCallback } from "react"
import SelectField from "./components/select"
import listOfGenreOption from "./store/genre.json"
import listOfMoodOption from "./store/mood.json"

const initialState = {
  genre: '',
  mood: '',
  level: '',
  aiResponses: []
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_GENRE':
      return { ...state, genre: action.payload, mood: '', aiResponses: [] }
    case 'SET_MOOD':
      return { ...state, mood: action.payload, aiResponses: [] }
    case 'SET_LEVEL':
      return { ...state, level: action.payload, aiResponses: [] }
    case 'SET_RESPONSES':
      return { ...state, aiResponses: action.payload }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { genre, mood, level, aiResponses } = state

  // determine mood options based on selected genre
  const moodOptions = genre ? listOfMoodOption[genre] || [] : []

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;

    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`
              }]
            }]
          })
        }
      );

      const data = await response.json()

      // check for API response
      const newResponses = data.candidates?.map(c => c.content?.parts?.[0]?.text).filter(Boolean) || []

      if (newResponses.length) {
        dispatch({ type: 'SET_RESPONSES', payload: [...aiResponses, ...newResponses] })
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err)
    }
  }, [genre, mood, level, aiResponses])

  return (
    <section>
      <SelectField
        placeholder="Please select a genre"
        id="genre"
        options={listOfGenreOption || []}
        onSelect={(value) => dispatch({ type: 'SET_GENRE', payload: value })}
        value={genre}
      />

      <SelectField
        placeholder="Please select a mood"
        id="mood"
        options={moodOptions}
        onSelect={(value) => dispatch({ type: 'SET_MOOD', payload: value })}
        value={mood}
      />

      <SelectField
        placeholder="Please select a level"
        id="level"
        options={['Beginner', "Intermediate", "Expert"]}
        onSelect={(value) => dispatch({ type: 'SET_LEVEL', payload: value })}
        value={level}
      />

      <button onClick={fetchRecommendations} disabled={!genre || !mood || !level}>
        Get Recommendation
      </button>

      <br /><br />

      {aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend}</p>
        </details>
      ))}
    </section>
  )
}