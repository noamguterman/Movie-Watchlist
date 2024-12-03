import './style.css'
import StarIcon from './images/star.png'
import RemoveIcon from './images/remove.png'

const idleContainer = document.getElementById('idle-container') as HTMLElement
const moviesDiv = document.getElementById('movies-container') as HTMLElement

type WatchlistMovie = {
    Poster: string,
    Title: string,
    imdbRating: string,
    Runtime: string,
    Genre: string,
    Plot: string,
    imdbID: string
}

document.addEventListener('DOMContentLoaded', () => {
    if (!moviesDiv) {
        console.error('Movies container not found')
        return
    }

    const watchlistArray = (() => {
        try {
            return JSON.parse(localStorage.getItem('watchlist') || '[]') as string[]
        } catch (error) {
            console.error('Error parsing watchlist:', error)
            return []
        }
    })()

    if (watchlistArray.length === 0) {
        idleContainer.style.display = 'block'
        return
    }

    fetchWatchlistMovies(watchlistArray, moviesDiv)
    idleContainer.style.display = 'none'
})

async function fetchWatchlistMovies(watchlistArray: string[], moviesDiv: HTMLElement) {
    let moviesHtml = ''

    for (const imdbID of watchlistArray) {
        try {
            const movieDetails = await fetchFullMovieDetails(imdbID)

            if (movieDetails) {
                const { Poster, Title, imdbRating, Runtime, Genre, Plot } = movieDetails

                moviesHtml += `
                    <div class="movie">
                        <img class="movie-poster" src="${Poster}" alt="${Title} Poster">
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
                                    <img class="add-icon" src="${RemoveIcon}" alt="Remove icon">
                                    <button class="btn-add" data-imdb-id="${imdbID}">Remove</button>
                                </div>
                            </div>
                            <p class="plot">${Plot}</p>
                        </div>
                    </div>
                    <hr>
                `
            } else {
                console.warn(`Failed to fetch details for movie ID: ${imdbID}`)
            }
        } catch (error) {
            console.error(`Error processing movie ${imdbID}:`, error)
        }
    }

    if (moviesHtml) {
        moviesDiv.innerHTML = moviesHtml
        attachRemoveWatchlistListeners()
    } else {
        moviesDiv.innerHTML = '<p>Unable to load watchlist movies. Please try again.</p>'
    }
}

async function fetchFullMovieDetails(imdbID: string): Promise<WatchlistMovie | null> {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=4165a4fa&i=${imdbID}`)
        const data = await response.json()

        if (data.Response === 'True') {
            return {
                Poster: data.Poster,
                Title: data.Title,
                imdbRating: data.imdbRating,
                Runtime: data.Runtime,
                Genre: data.Genre,
                Plot: data.Plot,
                imdbID: data.imdbID
            }
        } else {
            console.warn('API returned False for movie:', imdbID, data)
        }
    } catch (error) {
        console.error(`Error fetching details for IMDb ID ${imdbID}:`, error)
    }
    return null
}

function attachRemoveWatchlistListeners() {
    const buttons = document.querySelectorAll('.btn-add')
    
    buttons.forEach((button) => {
        const imdbID = button.getAttribute('data-imdb-id')

        if (imdbID) {
            button.addEventListener('click', () => {
                removeFromWatchlist(imdbID)
            })
        }
    })
}

function removeFromWatchlist(imdbID: string) {
    const watchlistArray = JSON.parse(localStorage.getItem('watchlist') || '[]') as string[]

    const index = watchlistArray.indexOf(imdbID)
    if (index !== -1) {
        watchlistArray.splice(index, 1)
        localStorage.setItem('watchlist', JSON.stringify(watchlistArray))
        location.reload()
    }
}