import { usePlanetStore } from "@/store/planet-store";

export function usePlanetEnergy() {
  const { addEnergy } = usePlanetStore();

  return {
    // Study
    noteCreated: () => addEnergy("mind", 10),
    quizCompleted: () => addEnergy("mind", 25),
    flashcardDone: () => addEnergy("mind", 5),
    brainDumpDone: () => addEnergy("mind", 15),
    mindmapCreated: () => addEnergy("mind", 20),
    // Job
    taskCompleted: () => addEnergy("hustle", 10),
    jobAdded: () => addEnergy("hustle", 20),
    resumeBuilt: () => addEnergy("hustle", 30),
    interviewDone: () => addEnergy("hustle", 25),
    skillGapDone: () => addEnergy("hustle", 15),
    emailGenerated: () => addEnergy("hustle", 10),
    // Canvas
    stickerPlaced: () => addEnergy("creative", 5),
    themeSaved: () => addEnergy("creative", 15),
    canvasCustomized: () => addEnergy("creative", 10),
    // Journal
    memoryCreated: () => addEnergy("memory", 20),
    gratitudeSaved: () => addEnergy("memory", 10),
    chapterAdded: () => addEnergy("memory", 15),
    // Vector
    equationSolved: () => addEnergy("mind", 15),
    graphPlotted: () => addEnergy("mind", 10),
    // Founder
    ideaValidated: () => addEnergy("hustle", 20),
    pitchBuilt: () => addEnergy("hustle", 25),
    roadmapGenerated: () => addEnergy("hustle", 20),
    // System
    dailyLogin: () => addEnergy("streak", 5),
  };
}
