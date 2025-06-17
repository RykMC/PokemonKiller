export default function Game() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Hintergrundbild */}
      <img
        src="/src/assets/bg1_game.png"
        alt="Startscreen Background"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Overlay + Inhalt */}
      <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white">
        
      </div>
    </div>
  );
}