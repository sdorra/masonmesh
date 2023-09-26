import { movies } from "./data";

export function MoviesRoot() {
	return (
		<>
			<h1>Movies</h1>
			<ul className="movies">
				{movies.map((movie) => (
					<li key={movie.title}>
						<img src={movie.image} alt={`Poster of "${movie.title}"`} />
						<h2>{movie.title}</h2>
						<p>{movie.genre}</p>
						<p>{movie.year}</p>
					</li>
				))}
			</ul>
		</>
	);
}
