import { movies } from "./data";

export function MoviesCountWidget() {
	return (
		<div className="metric-widget">
			<p className="title">Movies</p>
			<p className="metric">{movies.length}</p>
			<p className="note">/ Movies in the database</p>
		</div>
	);
}
