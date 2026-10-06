import { useEffect, useState } from 'react'
import { Link, Routes, Route, useParams } from 'react-router-dom'
import axios from 'axios'
import './App.css'

// Create an interface for storing data and presenting it on the website
interface NASA_Item {
  data: {
    nasa_id: string
    title: string
    year: number
    host: string
    planet_type: string
    discovery_method: string
    radius: string
    mass: string
    orbital_period: string
    description: string
    source_url: string
  }[]
  links?: {
    href: string
    rel: string
  }[]
}

interface NASA_Response {
  slug: string
  link: string
  acf: {
    display_name: string
    pl_hostname: string
    planet_type: string
    pl_discmethod: string
    pl_disc: number
    planet_radius?: string | false
    planet_mass?: string | false
    period_display?: string | false
    short_description?: string
    derived_description?: string
  }
  parsely?: {
    meta?: {
      thumbnailUrl?: string
    }
  }
}

// Sample data for now:
const sample_images: NASA_Item[] = [
  {
    data: [
      {
        nasa_id: "trappist-1-e",
        title: "TRAPPIST-1e Artist Concept",
        year: 2017,
        host: "TRAPPIST-1",
        planet_type: "Terrestrial",
        discovery_method: "Transit",
        radius: "0.92 Earth radii",
        mass: "0.692 Earth masses",
        orbital_period: "6.1 days",
        description: "An Earth-sized rocky exoplanet orbiting within the habitable zone of the ultracool dwarf star TRAPPIST-1.",
        source_url: 'https://science.nasa.gov/exoplanet-catalog/trappist-1-e/'
      }
    ],
    links: [
      {
        href: "https://images-assets.nasa.gov/image/PIA21422/PIA21422~thumb.jpg",
        rel: "preview"
      }
    ]
  },
  {
    data: [
      {
        nasa_id: "kepler-186-f",
        title: "Kepler-186f First Habitable-zone Earth-size Planet",
        year: 2014,
        host: "Kepler-186",
        planet_type: "Super Earth",
        discovery_method: "Transit",
        radius: "1.17 Earth radii",
        mass: "1.4 Earth masses",
        orbital_period: "129.9 days",
        description: "The first validated Earth-size planet orbiting a distant star in the habitable zone where liquid water might pool.",
        source_url: 'https://science.nasa.gov/exoplanet-catalog/kepler-186-f/'
      }
    ],
    links: [
      {
        href: "https://images-assets.nasa.gov/image/PIA18040/PIA18040~thumb.jpg",
        rel: "preview"
      }
    ]
  }
];

// Main webpage
function App() {
  const [images, setImages] = useState<NASA_Item[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const[sortOrder, setSortOrder] = useState('ascending')
  const [usingSample, setUpUsingSample] = useState(false)
  const [filters, setFilters] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Calling out data from the API
  useEffect(function() {
    let ignore = false

    axios.get<NASA_Response[]>('https://science.nasa.gov/wp-json/wp/v2/exoplanet', {
      params: {
        per_page: 100,
        page: 1,
        orderby: 'title',
        order: 'asc',
        _fields: 'slug,link,acf,parsely.meta.thumbnailUrl'
      },
      timeout: 10000
    }).then(function (response) {
      if (!ignore) {
        const planet_images: NASA_Item[] = response.data.map(function (item) {
          return {
            data: [{
              nasa_id: item.slug,
              title: item.acf?.display_name || 'Unknown',
              year: item.acf.pl_disc || 0,
              host: item.acf.pl_hostname || 'Unknown',
              planet_type: item.acf.planet_type || 'Unknown',
              discovery_method: item.acf.pl_discmethod || 'Unknown',
              radius: item.acf.planet_radius || 'Unknown',
              mass: item.acf.planet_mass || 'Unknown',
              orbital_period: item.acf.period_display || 'Unknown',
              description: item.acf.short_description || item.acf.derived_description || 'No description available.',
              source_url: item.link
            }],
            links: [{
              href: item.parsely?.meta?.thumbnailUrl || '',
              rel: 'preview'
            }]
          }
        })

        setImages(planet_images)
        setUpUsingSample(false)
        setIsLoading(false)
      }
    }).catch(function (error) {
      if (!ignore) {
        console.error('Could not load NASA Images: ', error)
        setImages(sample_images)
        setUpUsingSample(true)
        setIsLoading(false)
      }
    })

    return function () {
      ignore = true
    }
  }, [])

  // Filter Images based on what's written in the search bar
  const search_img = images.filter(function (image) {
    const query = search.trim().toLowerCase()

    if (query == '') {
      return false
    }

    const title = image.data[0].title.toLowerCase()
    return title.includes(query)
  })

  // Sort them by title or date created and ascending or descending
  const sorted_images = [...search_img].sort(function(a, b) {
    let compare: number

    if (sortBy == 'title') {
      compare = a.data[0].title.localeCompare(b.data[0].title)
    } else {
      compare = a.data[0].year - b.data[0].year
    }

    return sortOrder == 'descending' ? -compare : compare
  })

  // Filter Images through All, different years
  const gallery_images = images.filter(function(image) {
    return filters === 'all' || filters === image.data[0].planet_type
  })

  return (
    <>
      <section id="center">
        {/* Title Section */}
        <header>
          <h1>NASA Exoplanet Directory</h1>
        </header>

        {usingSample && (
          <p role='status'>
            NASA data is unavailable at the moment. Showing sample image records.
            Refresh page to try again.
          </p>
        )}

        {/* Switch between Search and Gallery */}
        <nav className='main-nav' aria-label='Main Navigation'>
          <Link to='/'>
            Search
          </Link>
          <Link to='/gallery'>
            Gallery
          </Link>
        </nav>

        <Routes>
          {/* Data Card */}
          <Route path='/details/:nasaId' element={<ImageDetails images={images} isLoading={isLoading} />}/>

          {/* Search Route */}
          <Route path="/" element={
            <>
              <h2>Search</h2>

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
                  <option value="date">Discovery Year</option>
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

              {search.trim() !== '' && images.length > 0 && (
                <p>
                  Showing {sorted_images.length} of {images.length} loaded exoplanets.
                </p>
              )}

              <ul className='search-results'>
                {sorted_images.map(function (image) {
                  const details = image.data[0]
                  const preview = image.links?.find(function (link) {
                    return link.rel == "preview"
                  })

                  return (
                    <li key={image.data[0].nasa_id}>
                      <Link className='search-card' to={'/details/' + encodeURIComponent(details.nasa_id)}>
                        {preview?.href ? (
                          <img src={preview.href} alt={details.title} loading='lazy' />
                        ) : (
                          <div className='search-placeholder'>
                            No preview available
                          </div>
                        )}
                        <div className='search-card-text'>
                          <h3>{details.title}</h3>
                          <p>Discovered: {details.year}</p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {search.trim() !== '' && images.length > 0 && sorted_images.length === 0 && (
                <p>No titles match your search.</p>
              )}
            </>
          } />

          {/* Gallery Route */}
          <Route path="/gallery" element={
            <div className='gallery-page'>
              <h2>Gallery</h2>
              <p>
                NASA catalog images are illustrations and may be shared by multiple exoplanets.
              </p>

              <div className='gallery-filters'>
                {['all', 'Terrestrial', 'Super Earth', 'Neptune-like', 'Gas Giant'].map(
                  function (type) {
                    return (
                      <button key={type} type='button' aria-pressed={filters === type} onClick={() => setFilters(type)}>
                        {type === 'all' ? 'All' : type}
                      </button>
                    )
                  }
                )}
              </div>

              <p>
                Showing {gallery_images.length} of {images.length} loaded exoplanets.
              </p>

              <ul className='gallery-grid'>
                {gallery_images.map(function (image) {
                  const details = image.data[0]
                  const preview = image.links?.find(function (link) {
                    return link.rel == "preview"
                  })

                  return (
                    <li className='gallery-card' key={details.nasa_id}>
                      <Link className='gallery-card-link' to={'/details/' + encodeURIComponent(details.nasa_id)}>
                        {preview?.href ? (
                          <img src={preview.href} alt={details.title} loading='lazy' />
                        ) : (
                          <div className='image-placeholder'>
                            No preview available
                          </div>
                        )}
                        <div className='search-card-text'>
                          <h3>{details.title}</h3>
                          <p>Discovered: {details.year}</p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {images.length > 0 && gallery_images.length === 0 && (
                <p>No exoplanets match this type.</p>
              )}
            </div>
          } />
        </Routes>
      </section>
    </>
  )
}

// Data Section
function ImageDetails({ images, isLoading } : { images: NASA_Item[]; isLoading: boolean }) {
  const { nasaId } = useParams()

  const curr_idx = images.findIndex(function (image) {
    return image.data[0].nasa_id == nasaId
  })

  const image = images[curr_idx]

  if (isLoading) {
    return (
      <p role='status'>Loading planet details. Please give us a moment</p>
    )
  }

  if (!image) {
    return (
      <p>
        This item is not available in the loaded data collection.
        <Link to='/'>Return to Search</Link>
      </p>
    )
  }

  const prev_idx = curr_idx === 0 ? images.length - 1 : curr_idx - 1
  const next_idx = curr_idx === images.length - 1 ? 0 : curr_idx + 1

  const prev_img = images[prev_idx]
  const next_img = images[next_idx]

  const details = image.data[0]
  const preview = image.links?.find(function (link) {
    return link.rel == "preview"
  })

  return (
    <article className='image-details'>
      <Link className='prev-button' aria-label='Previous planet' to={'/details/' + encodeURIComponent(prev_img.data[0].nasa_id)}>
        {' < '}
      </Link>

      <header className='detail-heading'>
        <h2>{details.title}</h2>
        <h3>Planet Identifier: {details.nasa_id}</h3>
      </header>

      <div className='detail-content'>
        <div className='detail-image'>
          {preview?.href ? (
            <img src={preview.href} alt={details.title} loading='lazy' />
          ) : (
            <div className='image-placeholder'>No preview available.</div>
          )}
        </div>

        <div className='data-info'>
          <p>Host Star: {details.host}</p>
          <p>Planet Type: {details.planet_type}</p>
          <p>Discovery Method: {details.discovery_method}</p>
          <p>Discovery Year: {details.year}</p>
          <p>Radius: {details.radius}</p>
          <p>Mass: {details.mass}</p>
          <p>Orbital Period: {details.orbital_period}</p>
          <p>{details.description || "No description available."}</p>
        </div>
      </div>

      <p className='data-sourceUrl'>
        <a href={details.source_url} target='_blank' rel='noreferrer'>
          View NASA Source
        </a>
      </p>

      <nav className='detail-bottom' aria-label='Return navigation'>
        <Link to='/'>Back to Search</Link>
        {' | '}
        <Link to='/gallery'>Back to Gallery</Link>
      </nav>

      <Link className='next-button' aria-label='Next planet' to={'/details/' + encodeURIComponent(next_img.data[0].nasa_id)}>
        {' > '}
      </Link>
    </article>
  )
}

export default App
