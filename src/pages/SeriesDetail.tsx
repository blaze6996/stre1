import { useParams } from "react-router-dom";
import DailymotionPlayer from "@/components/player/DailymotionPlayer";

const SeriesDetail = () => {
  const { id } = useParams();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Series</h1>
      <p className="mb-6 text-muted-foreground">ID: {id}. Connect Supabase to load episodes and metadata.</p>
      <DailymotionPlayer title="Series Player" />
    </main>
  );
};

export default SeriesDetail;
