import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import axios from 'axios'
import './App.css'

// Create an interface for storing data
interface NASA_Item {
  data: {
    nasa_id: string
    title: string
    date_created: string
  }[]
}

function App() {
  const [images, setImages] = useState<NASA_Item[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const[sortOrder, setSortOrder] = useState('ascending')

  // Calling out data from the API
  function load_images() {
    axios.get('https://images-api.nasa.gov/search', {
      params: {
        q: 'exoplanet',
        media_type: 'image',
        page_size: 50
      },
      timeout: 10000
    }).then(function (response) {
      setImages(response.data.collection.items)
      console.log(response.data.collection.items)
    }).catch(function (error) {
      console.error('Could not load NASA Images: ', error)
    });
  }

  const filtered_images = images.filter(function (image) {
    const title = image.data[0].title.toLowerCase()
    return title.includes(search.toLowerCase())
  })


  const sorted_images = [...filtered_images].sort(function(a, b) {
    let compare = 0

    if (sortBy == 'title') {
      compare = a.data[0].title.localeCompare(b.data[0].title)
    } else {
      compare = new Date(a.data[0].date_created).getTime() - new Date(b.data[0].date_created).getTime()
    }

    return sortOrder == 'descending' ? -compare : compare
  })

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>

        {/* Load the Data */}
        <button type='button' onClick={load_images}>
          Load NASA images
        </button>
        
        {/* Search control */}
        <div>
          <label htmlFor="search">Search this collection: </label>
          <input id="search" type="search" value={search} onChange={(event) => setSearch(event.target.value)}/>
        </div>

        {/* Sort the data by */}
        <div>
          <label htmlFor="sort-by">Sort By: </label>
          <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="title">Title</option>
            <option value="date">Date Created</option>
          </select>
        </div>

        {/* Arrage the data */}
        <div>
          <label htmlFor="sort-order">Order: </label>
          <select id="sort-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>

        <p>
          Showing {sorted_images.length} of {images.length} loaded items.
        </p>

        <ul>
          {sorted_images.map(function (image) {
            return (
              <li key={image.data[0].nasa_id}>
                {image.data[0].title}
                {' - '}
                {image.data[0].date_created.slice(0, 10)}
              </li>
            )
          })}
        </ul>

        {images.length > 0 && sorted_images.length === 0 && (
          <p>No titles match your search.</p>
        )}
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
