import { useQuery } from "@tanstack/react-query";
import type { HealthResponse } from "@rpg-realm/shared";

function App() {
  const { data } = useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
      return res.json();
    },
  });

  return <div>{data?.status}</div>;
}

export default App;
