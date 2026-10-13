const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
};

// List rows with optional filters, e.g. [{ key, value }]
const listRows = async (filters = [], orderBy = null, limit = 100) => {
  const params = new URLSearchParams();
  filters.forEach(({ key, value }) => {
    params.append('queries[]', `equal("${key}", "${value}")`);
  });
  if (orderBy) {
    params.append('queries[]', `orderDesc("${orderBy}")`);
  }
  params.append('queries[]', `limit(${limit})`);

  const res = await fetch(
    `${ENDPOINT}/databases/${DATABASE_ID}/tables/${TABLE_ID}/rows?${params.toString()}`,
    { headers }
  );

  if (!res.ok) throw new Error(`listRows failed: ${res.status}`);
  return res.json(); // { rows: [...] }
};

const createRow = async (data) => {
  const res = await fetch(
    `${ENDPOINT}/databases/${DATABASE_ID}/tables/${TABLE_ID}/rows`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    }
  );
  if (!res.ok) throw new Error(`createRow failed: ${res.status}`);
  return res.json();
};

const updateRow = async (rowId, data) => {
  const res = await fetch(
    `${ENDPOINT}/databases/${DATABASE_ID}/tables/${TABLE_ID}/rows/${rowId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ data }),
    }
  );
  if (!res.ok) throw new Error(`updateRow failed: ${res.status}`);
  return res.json();
};

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await listRows([{ key: 'searchTerm', value: searchTerm }]);
    const rows = result.rows ?? [];

    if (rows.length > 0) {
      const row = rows[0];
      await updateRow(row.$id, { count: row.count + 1 });
    } else {
      await createRow({
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error('updateSearchCount error:', error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await listRows([], 'count', 5);
    return result.rows ?? [];
  } catch (error) {
    console.error('getTrendingMovies error:', error);
    return [];
  }
};
