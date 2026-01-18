import React, { useReducer, useCallback, useEffect } from "react"
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
      return { ...state, genre: action.payload, mood: '' } // Reset mood when genre changes
    case 'SET_MOOD':
      return { ...state, mood: action.payload }
    case 'SET_LEVEL':
      return { ...state, level: action.payload }
    case 'SET_RESPONSES':
      return { ...state, aiResponses: action.payload }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { genre, mood, level, aiResponses } = state

  useEffect(() => {
    dispatch({ type: 'SET_RESPONSES', payload: [] })
  }, [genre, mood, level])

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;

    try {
      const GEMINI_API_KEY = 'AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I' // Consider moving to env
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
        GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.` }] }]
          })
        }
      );
      const data = await response.json();
      if (data.candidates) {
        const newResponses = data.candidates.map(candidate => candidate.content.parts[0].text)
        dispatch({ type: 'SET_RESPONSES', payload: [...aiResponses, ...newResponses] })
      }
    } catch (err) {
      console.log(err)
    }
  }, [genre, mood, level, aiResponses])

  return (<section>
    <SelectField
      placeholder="Please select a genre"
      id="genre"
      options={listOfGenreOption}
      onSelect={(value) => dispatch({ type: 'SET_GENRE', payload: value })}
      value={genre}
    />

    <SelectField
      placeholder="Please select a mood"
      id="mood"
      options={availableMoodBasedOnGenre || []}
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

    <button onClick={fetchRecommendations}>
      Get Recommendation
    </button>

    <br />
    <br />
    {
      aiResponses.map((recommend, index) => {
        return (
          <details key={index} name="recommendation">
            <summary>Recommendation {index + 1}</summary>
            <p> {recommend}</p>
          </details>
        )
      })
    }

  </section>)
}