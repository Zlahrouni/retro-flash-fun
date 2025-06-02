import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Shuffle, Home, RotateCcw } from "lucide-react";

const Icebreaker = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  // Collection étendue de questions fun et express
  const questions = [
    // Questions classiques fun
    "Si tu pouvais avoir un super-pouvoir pendant 24h, lequel choisirais-tu ?",
    "Quelle est la chose la plus bizarre que tu aies jamais mangée ?",
    "Si tu étais un emoji, lequel serais-tu et pourquoi ?",
    "Quel est ton gif de réaction préféré ?",
    "Si tu pouvais être ami avec une célébrité, qui choisirais-tu ?",

    // Questions classiques fun
    "Si tu pouvais échanger ta vie avec un personnage de fiction pendant une semaine, qui choisirais-tu ?",
    "Quelle application sur ton téléphone utilises-tu le plus (honteusement) ?",
    "Si tu devais manger un seul plat pour le reste de ta vie, lequel serait-ce ?",
    "Quelle est la chanson que tu connais par cœur (mais que tu n’assumes pas) ?",
    "Quel serait ton animal totem selon ton humeur actuelle ?",

// Questions créatives
    "Si ton humeur était un mème, lequel serait-ce ?",
    "Décris la dernière réunion en une punchline de film !",
    "Si ton bureau avait une mascotte, à quoi ressemblerait-elle ?",
    "Invente une nouvelle fête absurde à célébrer chaque année !",
    "Si tu pouvais repeindre le ciel d’une autre couleur, laquelle et pourquoi ?",

    // Questions créatives
    "Invente un nouveau nom pour ton équipe en utilisant seulement des noms d'animaux !",
    "Décris ton humeur du moment avec seulement des titres de films !",
    "Si ta vie était un genre de musique, lequel serait-ce ?",
    "Quel serait ton slogan personnel sur un t-shirt ?",
    "Si tu pouvais renommer n'importe quel objet du quotidien, lequel et comment ?",

    // Questions nostalgie
    "Quel est le dernier truc qui t'a fait rire aux éclats ?",
    "Raconte une mode de ton enfance que tu trouvais géniale !",
    "Quel dessin animé regardais-tu en boucle quand tu étais petit(e) ?",
    "Quelle était ta peur la plus irrationnelle enfant ?",
    "Quel jeu vidéo/jouet t'a le plus marqué(e) ?",

    // Questions rapides et fun
    "Pizza hawaïenne : crime contre l'humanité ou génie culinaire ?",
    "Chats ou chiens ? (et explique ta trahison si tu dis chats 😄)",
    "Révèle nous ton talent secret le plus inutile !",
    "Quelle est ta superstition la plus ridicule ?",
    "Si tu étais un personnage de sitcom, dans quelle série vivrais-tu ?",

    // Questions décalées
    "Explique ta journée type mais en tant que super-héros/super-vilain !",
    "Quel objet dans cette pièce deviendrait ton arme dans un film d'action ?",
    "Si les animaux pouvaient parler, lequel serait le plus impoli ?",
    "Invente le pire conseil possible pour réussir sa vie !",
    "Quelle serait ta stratégie pour survivre dans un film d'horreur ?",

    // Questions hypothétiques rigolotes
    "Si tu pouvais échanger de corps avec quelqu'un de l'équipe pendant 1h, qui et pourquoi ?",
    "Tu gagnes 1 million mais tu dois porter un costume de mascotte pendant 1 an. Tu acceptes ?",
    "Si tu pouvais ajouter une fonctionnalité bizarre à WhatsApp, laquelle ?",
    "Quel serait ton dernier repas avant la fin du monde ?",
    "Si tu étais président du monde pendant 24h, quelle loi ridicule voterais-tu ?",

    // Questions team building
    "Raconte le moment le plus gênant de ta carrière (sans noms !) ",
    "Quel collègue ferait le meilleur coéquipier dans Koh Lanta ?",
    "Si notre équipe était un boys/girls band, qui aurait quel rôle ?",
    "Quelle serait la devise officielle de notre équipe ?",
    "Dans quel univers de série/film notre équipe s'intégrerait le mieux ?",

    // Questions express créatives
    "Décris ta semaine en 3 gifs mentaux !",
    "Invente un cocktail qui représente ton état d'esprit !",
    "Si ton bureau était un lieu touristique, quelle serait sa spécialité ?",
    "Quel serait ton nom de scène si tu étais rappeur/rappeuse ?",
    "Transforme ton dernier projet en titre de film d'action !",

    // Questions bonus fun
    "Révèle nous ton péché mignon le plus secret (niveau bouffe) !",
    "Quel est le dernier truc complètement inutile que tu as googlé ?",
    "Si tu pouvais hacker n'importe quel écran dans le monde, qu'afficherais-tu ?",
    "Raconte nous ta théorie du complot la plus farfelue !",
    "Si tu étais un produit Amazon, quels seraient tes avis clients ?",

    // Questions de fin
    "Donne un conseil de vie en moins de 10 mots !",
    "Quel serait ton autobiographie en un seul tweet ?",
    "Si tu pouvais laisser un message à toi-même d'il y a 5 ans, lequel ?",
    "Termine cette phrase : 'Ce qui me rend unique, c'est...'",
    "Partage quelque chose que tu as appris cette semaine !"
  ];

  // Fonction pour obtenir une question aléatoire non utilisée
  const getRandomQuestion = () => {
    const availableQuestions = questions
        .map((_, index) => index)
        .filter(index => !usedQuestions.includes(index));

    if (availableQuestions.length === 0) {
      // Toutes les questions ont été utilisées, reset
      setUsedQuestions([]);
      return Math.floor(Math.random() * questions.length);
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  };

  // Fonction pour passer à la question suivante avec effet de carte
  const nextQuestion = () => {
    setIsCardFlipping(true);

    setTimeout(() => {
      const newIndex = getRandomQuestion();
      setCurrentQuestionIndex(newIndex);
      setUsedQuestions(prev => [...prev, newIndex]);
      setIsCardFlipping(false);
    }, 300);
  };

  // Réinitialiser les questions
  const resetQuestions = () => {
    setUsedQuestions([]);
    setCurrentQuestionIndex(getRandomQuestion());
  };

  const currentQuestion = questions[currentQuestionIndex];
  const questionsRemaining = questions.length - usedQuestions.length;

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  RetroFlow Icebreaker
                </h1>
              </div>
              <Button
                  variant="outline"
                  onClick={() => window.location.href = "/"}
                  className="text-gray-600 hover:text-gray-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Questions Icebreaker 🎯
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Brisez la glace avec votre équipe ! Des questions fun et express pour créer des liens et rigoler ensemble.
              </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 text-center">
                <div className="text-2xl font-bold text-purple-600">{questions.length}</div>
                <div className="text-sm text-gray-600">Questions au total</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-pink-200 text-center">
                <div className="text-2xl font-bold text-pink-600">{usedQuestions.length}</div>
                <div className="text-sm text-gray-600">Questions posées</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 text-center">
                <div className="text-2xl font-bold text-orange-600">{questionsRemaining}</div>
                <div className="text-sm text-gray-600">Questions restantes</div>
              </div>
            </div>

            {/* Carte avec la question */}
            <div className="relative mb-8">
              <div
                  className={`transition-all duration-300 transform ${
                      isCardFlipping ? 'scale-95 rotate-y-180 opacity-50' : 'scale-100 rotate-0 opacity-100'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
              >
                <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-2 border-purple-200 shadow-2xl min-h-[300px] relative overflow-hidden">
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[400%]"></div>

                  <CardContent className="p-12 text-center relative z-10">
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-2xl">🎭</span>
                      </div>
                      <div className="text-sm text-purple-600 font-medium mb-4">
                        Question #{usedQuestions.length + 1}
                      </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed mb-8">
                      {currentQuestion}
                    </h3>

                    <div className="flex justify-center items-center space-x-4">
                      <div className="flex space-x-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                    i < (usedQuestions.length % 5) + 1
                                        ? 'bg-purple-500'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Effet de cartes en arrière-plan */}
              <div className="absolute -inset-4 -z-10">
                <Card className="bg-gradient-to-br from-purple-100/50 to-pink-100/50 backdrop-blur-sm border border-purple-100 transform rotate-2 translate-x-2 translate-y-2" />
                <Card className="bg-gradient-to-br from-pink-100/30 to-orange-100/30 backdrop-blur-sm border border-pink-100 transform -rotate-1 translate-x-1 translate-y-1 absolute inset-0" />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button
                  onClick={nextQuestion}
                  disabled={isCardFlipping}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
              >
                {isCardFlipping ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Nouvelle carte...
                    </>
                ) : (
                    <>
                      <Shuffle className="w-5 h-5 mr-2" />
                      Question suivante
                    </>
                )}
              </Button>

              <Button
                  onClick={resetQuestions}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Recommencer
              </Button>
            </div>

            {/* Message de fin */}
            {questionsRemaining === 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">🎉</span>
                    <h4 className="text-xl font-bold text-yellow-800 mb-2">
                      Toutes les questions ont été posées !
                    </h4>
                    <p className="text-yellow-700">
                      Votre équipe a fait le tour de toutes nos questions. Recommencez pour en découvrir de nouvelles combinaisons !
                    </p>
                  </div>
                </div>
            )}

            {/* Conseils d'utilisation */}
            <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  💡 Comment bien utiliser l'icebreaker ?
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-bold">1</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Réponse express</h5>
                        <p className="text-gray-600 text-sm">Chacun répond en 30 secondes max pour garder le rythme !</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">À tour de rôle</h5>
                        <p className="text-gray-600 text-sm">Passez la parole dans l'ordre ou désignez qui répond !</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Pas de jugement</h5>
                        <p className="text-gray-600 text-sm">L'objectif est de s'amuser et apprendre à se connaître !</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 font-bold">4</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Rebondissez</h5>
                        <p className="text-gray-600 text-sm">N'hésitez pas à poser des questions de suivi amusantes !</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-600 font-bold">5</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Timing parfait</h5>
                        <p className="text-gray-600 text-sm">Idéal en début de meeting ou pendant une pause !</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-bold">6</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Gardez le fun</h5>
                        <p className="text-gray-600 text-sm">L'objectif est de créer de la cohésion et de la bonne humeur !</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-center text-purple-700 font-medium">
                    🎯 <strong>Pro tip :</strong> Mélangez avec vos rétrospectives pour créer une atmosphère détendue !
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  );
};

export default Icebreaker;