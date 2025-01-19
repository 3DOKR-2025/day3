import "./App.css"
import {useEffect, useState} from "react"

const apiUrl = "http://localhost:3000/api"

function App() {
  const [fact, setFact] = useState("")
  let numberString = window.location.pathname.split("/").pop()

  useEffect(() => {
    async function fetchFact() {
      if (!numberString) {
        setFact("Please provide a number in the URL.")
        return
      }
      const number = Number(numberString)
      if (isNaN(number)) {
        setFact("This is not a number.")
        return
      }
      try {
        const response = await fetch(`${apiUrl}/facts/${number}`)
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status} while retrieving number fact for ${number}`)
        }
        const result = await response.json()
        setFact(result.fact)
      } catch (error) {
        console.error("Error while fetching number fact from API.", error)
        setFact("Error! Please try again.")
      }
    }
    fetchFact()
  }, [numberString])

  return <>
    <h1>
      {fact ? fact : "Loading…"}
    </h1>
  </>
}

export default App
