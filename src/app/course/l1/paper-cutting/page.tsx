import InteractionBoard from '@/components/PaperCutting/InteractionBoard';

export default function PaperCuttingPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-red-700">剪纸 (Window Paper Cutting)</h1>
      <InteractionBoard />
    </div>
  );
}
