import { movies } from "./data";

export function MoviesRoot() {
	return (
		<>
			<h1>Movies</h1>
			<ul>
				{movies.map((movie) => (
					<li key={movie.title}>{movie.title}</li>
				))}
			</ul>
		</>
	);
}
