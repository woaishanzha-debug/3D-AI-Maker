import InteractionBoard from './InteractionBoard';

export default function CoalSealLabPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">煤精组印 - 数字工坊</h1>
      </header>
      <main className="flex-1 p-4 flex justify-center items-center">
        <InteractionBoard />
      </main>
    </div>
  );
}
