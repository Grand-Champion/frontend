export async function load({ fetch }) {
  const response = await fetch(
    "http://localhost:3011/forests/api/v1/forests/1"
  );
  const data = await response.json();

  return {
    forestData: data,
  };
}
