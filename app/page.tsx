'use client';

import { useEffect, useState } from 'react';
import { Search, Play, ExternalLink, X, Clapperboard } from 'lucide-react';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
};

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

type Trailer = { site: string; type: string; official?: boolean; key: string };
type WatchData = Partial<Record<'flatrate' | 'free' | 'ads' | 'rent' | 'buy', Provider[]>> & { link?: string };
type Detail = { videos?: Trailer[]; watch?: WatchData };

const sections = [
  ['popular', 'Popular'],
  ['now_playing', 'New Releases'],
  ['top_rated', 'Top Rated'],
  ['upcoming', 'Coming Soon'],
];

const groups: [keyof Omit<WatchData, 'link'>, string][] = [
  ['flatrate', 'Subscription'],
  ['free', 'Free'],
  ['ads', 'Free with ads'],
  ['rent', 'Rent'],
  ['buy', 'Buy'],
];

const poster = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : '';

// These are provider search destinations, not verified direct movie pages.
// Providers without a known search destination use TMDB's watch-options page.
function providerUrl(providerName: string, movieTitle: string, watchLink?: string) {
  const name = providerName.toLowerCase();
  const q = encodeURIComponent(movieTitle);

  if (name.includes('amazon') || name.includes('prime video')) {
    return `https://www.amazon.com/s?k=${q}&i=instant-video`;
  }
  if (name.includes('youtube')) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(movieTitle + ' movie')}`;
  }
  if (name.includes('apple tv')) {
    return `https://tv.apple.com/search?term=${q}`;
  }
  return watchLink || null;
}

export default function Home() {
  const [section, setSection] = useState('popular');
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [cols, setCols] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Movie | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('villa57-cols');
    if (saved && [1, 2, 4].includes(Number(saved))) setCols(Number(saved));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const url = query.trim()
          ? `/api/search?q=${encodeURIComponent(query.trim())}`
          : `/api/movies?section=${section}&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        if (active) {
          setError(data.error || '');
          setMovies(previous =>
            query.trim() || page === 1
              ? (data.results || [])
              : [...previous, ...(data.results || [])]
          );
        }
      } catch {
        if (active) setError('Could not load movies.');
      } finally {
        if (active) setLoading(false);
      }
    }, query ? 350 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [section, query, page]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetail(null);
    fetch(`/api/movie/${selected.id}`)
      .then(response => response.json())
      .then(data => { if (active) setDetail(data); })
      .catch(() => {});
    return () => { active = false; };
  }, [selected]);

  const setLayout = (number: number) => {
    setCols(number);
    localStorage.setItem('villa57-cols', String(number));
  };

  const trailer =
    detail?.videos?.find(video => video.site === 'YouTube' && video.type === 'Trailer' && video.official) ||
    detail?.videos?.find(video => video.site === 'YouTube' && video.type === 'Trailer');

  return (
    <>
      <header>
        <div className="brand"><Clapperboard size={25} /><span>VILLA <b>57</b></span></div>
        <span className="tagline">Discover your next favorite movie</span>
      </header>

      <main>
        <div className="hero">
          <h1>Explore the world of movies.</h1>
          <p>Posters, ratings, trailers and US watch options — all in one place.</p>
          <label className="search">
            <Search size={20} />
            <input
              aria-label="Search movies"
              value={query}
              onChange={event => { setQuery(event.target.value); setPage(1); }}
              placeholder="Search movie titles..."
            />
          </label>
        </div>

        <nav aria-label="Movie categories">
          {sections.map(([key, name]) => (
            <button
              key={key}
              className={section === key && !query ? 'active' : ''}
              onClick={() => { setQuery(''); setSection(key); setPage(1); }}
            >{name}</button>
          ))}
        </nav>

        <div className="toolbar">
          <h2>{query ? 'Search Results' : sections.find(item => item[0] === section)?.[1]}</h2>
          <div className="layouts" aria-label="Poster columns">
            {[1, 2, 4].map(number => (
              <button
                key={number}
                aria-label={`${number} columns`}
                aria-pressed={cols === number}
                className={cols === number ? 'active' : ''}
                onClick={() => setLayout(number)}
              >{number}</button>
            ))}
          </div>
        </div>

        {error && <p className="error">{error} Configure TMDB_READ_ACCESS_TOKEN on the server to enable the catalog.</p>}

        <div className={`movies cols-${cols}`}>
          {movies.map(movie => (
            <button className="movie" key={movie.id} onClick={() => setSelected(movie)}>
              {movie.poster_path
                ? <img loading="lazy" src={poster(movie.poster_path)} alt={`${movie.title} poster`} />
                : <div className="no-poster">No poster</div>}
              <span className="movie-name">{movie.title}</span>
              <span className="movie-meta">
                {movie.release_date?.slice(0, 4) || '—'}
                <span>★ {movie.vote_average?.toFixed(1) || '—'}</span>
              </span>
            </button>
          ))}
        </div>

        {loading && <p className="status">Loading movies…</p>}
        {!loading && !movies.length && !error && <p className="status">No movies found.</p>}
        {!query && !loading && movies.length > 0 && (
          <button className="more" onClick={() => setPage(previous => previous + 1)}>Load more movies</button>
        )}
      </main>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={event => event.stopPropagation()}
          >
            <button className="close" aria-label="Close" onClick={() => setSelected(null)}><X /></button>
            <div className="detail-top">
              {selected.poster_path && <img src={poster(selected.poster_path)} alt="" />}
              <div>
                <h2>{selected.title}</h2>
                <p className="muted">{selected.release_date?.slice(0, 4)} · ★ {selected.vote_average?.toFixed(1)}</p>
                <p>{selected.overview || 'No synopsis available.'}</p>
                {trailer && (
                  <a
                    className="trailer"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`}
                  ><Play size={17} /> Watch trailer</a>
                )}
              </div>
            </div>

            <h3>Where to Watch · United States</h3>
            <p className="muted small">Availability is supplied by TMDB/JustWatch and may change. Confirm price and access with the provider.</p>

            {groups.map(([key, label]) => {
              const providers = detail?.watch?.[key] || [];
              return providers.length ? (
                <div className="provider-group" key={key}>
                  <strong>{label}</strong>
                  <div className="providers">
                    {providers.map(provider => {
                      const url = providerUrl(provider.provider_name, selected.title, detail?.watch?.link);
                      const content = (
                        <>
                          {provider.logo_path && <img src={poster(provider.logo_path)} alt="" />}
                          {provider.provider_name}
                          {url && <ExternalLink size={13} />}
                        </>
                      );
                      return url ? (
                        <a
                          className="provider"
                          key={provider.provider_id}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Find ${selected.title} on ${provider.provider_name}`}
                        >{content}</a>
                      ) : (
                        <span className="provider" key={provider.provider_id}>{content}</span>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })}

            {detail && !groups.some(([key]) => detail.watch?.[key]?.length) && (
              <p className="muted">No verified US options reported by the data provider.</p>
            )}
            {detail?.watch?.link && (
              <a className="watchlink" target="_blank" rel="noopener noreferrer" href={detail.watch.link}>
                View watch options <ExternalLink size={15} />
              </a>
            )}
            <p className="attribution">Watch availability data by JustWatch via TMDB. Provider listings are informational and not guaranteed. Provider buttons may open search pages rather than direct playback.</p>
          </section>
        </div>
      )}

      <footer>
        Villa 57 · Public movie discovery · Movie data and images from{' '}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
        {' '}This product uses the TMDB API but is not endorsed or certified by TMDB.
        {' '}Watch provider data attributed to JustWatch.
      </footer>
    </>
  );
}
