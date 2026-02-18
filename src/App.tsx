import { DockerComposeGenerator } from "@/pages/DockerComposeGenerator";
import { useBaiduAnalytics } from "@/hooks/useBaiduAnalytics";

export function App() {
  // Initialize Baidu Analytics (production only, via hook)
  useBaiduAnalytics();

  return <DockerComposeGenerator />;
}

export default App;