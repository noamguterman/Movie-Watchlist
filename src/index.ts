import './style.css'
import StarIcon from './images/star.png'
import AddIcon from './images/add.png'
import RemoveIcon from './images/remove.png'

let watchlistArray: string[] = JSON.parse(localStorage.getItem('watchlist') || '[]')
const searchInput = document.getElementById('search-input') as HTMLInputElement
const searchBtn = document.getElementById('btn-search') as HTMLButtonElement
const idleContainer = document.getElementById('idle-container') as HTMLElement
const idleText = document.getElementById('idle-text') as HTMLElement
const moviesDiv = document.getElementById('movies-container') as HTMLElement

// Event listener for the search button - mouse click
searchBtn?.addEventListener('click', async () => {
    if (searchInput.value.trim() === '') {
        idleContainer.style.display = 'block'
        idleText.textContent = 'Please enter a search term.'
        moviesDiv.style.display = 'none'
        return
    }
    await getMovies()
})

// Event listener for the search button - keyboard Enter
searchInput?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        if (searchInput.value.trim() === '') {
            idleContainer.style.display = 'block'
            idleText.textContent = 'Please enter a search term.'
            moviesDiv.style.display = 'none'
            return
        }
        await getMovies()
    }
})

type Movie = {
    Poster: string,
    Title: string,
    imdbID: string
}

type MovieDetails = {
    imdbRating: string,
    Runtime: string,
    Genre: string,
    Plot: string
}

// Fetch movies based on search input
async function getMovies() {
    try {
        idleContainer.style.display = 'block'
        idleText.textContent = 'Loading...'
        moviesDiv.style.display = 'none'

        const data = await fetchJson(`https://www.omdbapi.com/?apikey=4165a4fa&type=movie&s=${searchInput.value}`)
        let moviesHtml = ''

        if (data.Search) {
            for (const movie of data.Search as Movie[]) {
                const movieDetails = await getMovieDetails(movie.imdbID)

                if (movieDetails) {
                    const { Poster, Title } = movie;
                    const { imdbRating, Runtime, Genre, Plot } = movieDetails

                    if (Plot !== 'N/A' && Runtime !== 'N/A') {
                        const isInWatchlist = watchlistArray.includes(movie.imdbID)
                        const buttonIcon = isInWatchlist ? RemoveIcon : AddIcon
                        const buttonText = isInWatchlist ? 'Remove' : 'Watchlist'

                        moviesHtml += `
                        <div class="movie">
                            <img class="movie-poster" src="${Poster !== 'N/A' ? Poster : 'fallback-image-url'}" alt="${Title} Poster">
                            <div class="movie-details">
                                <div class="movie-heading">
                                    <span class="title">${Title}</span>
                                    <div class="rating-container">
                                        <img class="star-icon" src="${StarIcon}" alt="Star rating icon">
                                        <span class="rating">${imdbRating}</span>
                                    </div>
                                </div>
                                <div class="movie-subheading">
                                    <span class="runtime">${Runtime}</span>
                                    <span class="genre">${Genre}</span>
                                    <div class="wishlist-container">
                                        <img class="add-icon" src="${buttonIcon}" alt="Add/Remove icon" data-imdb-id="${movie.imdbID}">
                                        <button class="btn-add" data-imdb-id="${movie.imdbID}">${buttonText}</button>
                                    </div>
                                </div>
                                <p class="plot">${Plot}</p>
                            </div>
                        </div>
                        <hr>
                        `
                    }
                }
            }

            if (moviesHtml) {
                idleContainer.style.display = 'none'
                moviesDiv.style.display = 'block'
                moviesDiv.innerHTML = moviesHtml

                attachWatchlistListeners()
            } else {
                idleText.textContent = 'No results found. Please try a different search term.'
            }
        } else {
            idleText.textContent = 'No results found. Please try a different search term.'
        }
    } catch (error) {
        console.error('Error fetching movies:', error)
        idleText.textContent = 'Error fetching data. Please try again later.'
    }
}

// Fetch movie details by IMDb ID
async function getMovieDetails(imdbID: string): Promise<MovieDetails | null> {
    try {
        const data = await fetchJson(`https://www.omdbapi.com/?apikey=4165a4fa&i=${imdbID}`)
        if (data.imdbRating && data.Runtime && data.Genre && data.Plot) {
            return {
                imdbRating: data.imdbRating,
                Runtime: data.Runtime,
                Genre: data.Genre,
                Plot: data.Plot,
            }
        }
    } catch (error) {
        console.error(`Error fetching details for IMDb ID ${imdbID}:`, error)
    }
    return null
}

// Utility function to fetch JSON data with error handling
async function fetchJson(url: string): Promise<any> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
}

// Add eventListeners to all btn-add buttons
function attachWatchlistListeners() {
    const buttons = document.querySelectorAll('.btn-add, .add-icon') as NodeListOf<HTMLButtonElement>;
    buttons.forEach((button) => {
        const imdbID = button.getAttribute('data-imdb-id');
        
        if (imdbID) {
            const addIcon = button.previousElementSibling as HTMLImageElement
            
            if (watchlistArray.includes(imdbID)) {
                if (addIcon) {
                    addIcon.src = RemoveIcon
                    button.textContent = 'Remove'
                }
            } else {
                if (addIcon) {
                    addIcon.src = AddIcon
                    button.textContent = 'Watchlist'
                }
            }

            button.addEventListener('click', () => {
                toggleWatchlist(imdbID!)
            })
        }
    })
}

function toggleWatchlist(imdbID: string) {
    const index = watchlistArray.indexOf(imdbID)

    const movieButton = document.querySelector(`button[data-imdb-id="${imdbID}"]`) as HTMLButtonElement
    const addIcon = movieButton?.previousElementSibling as HTMLImageElement

    if (index !== -1) {
        watchlistArray.splice(index, 1)

        if (addIcon) {
            addIcon.src = AddIcon;
            movieButton.textContent = 'Watchlist'
        }
    }
    else {
        watchlistArray.unshift(imdbID)

        if (addIcon) {
            addIcon.src = RemoveIcon;
            movieButton.textContent = 'Remove'
        }
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlistArray))
}