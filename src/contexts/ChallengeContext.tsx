import { createContext, useState, ReactNode, useEffect } from "react";
import Cookies from 'js-cookie';
import challenges from '../challenges.json'
import { LevelUpModal } from "../components/LevelUpModal";

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData{
    level: number;
    currentExperience: number;
    challengesCompleted: number;
    experienceToNextLevel: number;
    activeChallenge:  Challenge;
    levelUp: () => void;
    resetChallenge: ( ) => void;
    startNewChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: ()=> void;
}

interface ChallengesProviderProps{
    children: ReactNode;
    level: number;
    currentExperience:number;
    challengesCompleted: number;
}
export const ChallengesContext = createContext({} as ChallengesContextData );

export function ChallengesProvider({ children, ...rest }: ChallengesProviderProps){
    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrenteExperience] = useState(rest.currentExperience ??0);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const experienceToNextLevel = Math.pow((level +1) * 4,2)
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);


    useEffect(() => {
        Notification.requestPermission();
    }, []);

    useEffect(() =>{
        Cookies.set('level', String(level));
        Cookies.set('challengesCompleted', String(challengesCompleted));
        Cookies.set('currentExperience', String(currentExperience))
    }, [level, challengesCompleted, currentExperience])

    function resetChallenge(){
        setActiveChallenge(null);
    }
    function levelUp(){
        setLevel(level +1);
        setIsLevelUpModalOpen(true);
    }

    function closeLevelUpModal(){
        setIsLevelUpModalOpen(false); 
    }

    function completeChallenge(){
         if(!activeChallenge){
             return;
         }

         const {amount } = activeChallenge;
         let finalExperience = currentExperience + amount;
        
         if(finalExperience >= experienceToNextLevel ){
            finalExperience = finalExperience-experienceToNextLevel;
            levelUp();
         }

         setCurrenteExperience(finalExperience);
         setActiveChallenge(null);
         setChallengesCompleted(challengesCompleted + 1);
    }

    function startNewChallenge(){
        const randonChallengeIndex = Math.floor(Math.random() * challenges.length )
        const challenge = challenges[randonChallengeIndex];
        
        setActiveChallenge(challenge);
        
        new Audio('/notification.mp3').play();

        if(Notification.permission === 'granted'){
            new Notification('Novo desafio!', {
                body: `Valendo ${challenge.amount}xp.`
            })
        }
    }
    return(
        <ChallengesContext.Provider 
            value={{
                level, 
                currentExperience, 
                challengesCompleted,
                experienceToNextLevel,  
                levelUp, 
                startNewChallenge,
                activeChallenge,
                resetChallenge,
                completeChallenge,
                closeLevelUpModal,
                }}>

            {children}

            {isLevelUpModalOpen && <LevelUpModal />}

        </ChallengesContext.Provider>
    )
}