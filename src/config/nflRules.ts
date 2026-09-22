/**
 * Plain-language NFL reminders, most looked-up first.
 * Not the league's official text. Edit the order here if you want a rule higher.
 */
export type NflRule = {
  id: string
  title: string
  result: string
  body: string
}

export const nflRules: NflRule[] = [
  {
    id: 'false-start',
    title: 'False start',
    result: '5 yards. Same down.',
    body: 'Someone on offense moves in a way that simulates the snap before the ball is snapped. The play is blown dead. It is the most common flag in the league.',
  },
  {
    id: 'holding-offense',
    title: 'Offensive holding',
    result: '10 yards. Replay the down.',
    body: 'A blocker grabs or hooks a defender instead of engaging with his body. If it happens behind the line it is usually enforced from the previous spot. Downfield it can be enforced from the spot of the foul.',
  },
  {
    id: 'defensive-pi',
    title: 'Defensive pass interference',
    result: 'Spot of the foul. Automatic first down.',
    body: 'A defender significantly hinders an eligible receiver’s chance to catch a catchable ball, before the ball arrives. Face-guarding by itself is not enough. The ball has to be in the air.',
  },
  {
    id: 'defensive-holding',
    title: 'Defensive holding',
    result: '5 yards. Automatic first down.',
    body: 'A defender grabs a receiver before the ball is thrown, or restricts him away from the play. It is the short version of interference, called when the ball is not yet in the air.',
  },
  {
    id: 'offside',
    title: 'Offside and encroachment',
    result: '5 yards. Same down.',
    body: 'A defender is in the neutral zone at the snap, or he crosses it and makes contact before the snap. Encroachment is blown dead immediately. A plain offside can be a free play for the offense if the ball is snapped.',
  },
  {
    id: 'delay',
    title: 'Delay of game',
    result: '5 yards. Clock reset or runoff depends on the situation.',
    body: 'The offense does not snap before the play clock hits zero, or the defense deliberately slows the snap. The play clock is 40 seconds from the end of the last play, or 25 after a stoppage such as a penalty or a change of possession.',
  },
  {
    id: 'illegal-contact',
    title: 'Illegal contact',
    result: '5 yards. Automatic first down.',
    body: 'Beyond five yards from the line, a defender initiates contact with a receiver while the ball is still in the quarterback’s hands. Inside five yards, a jam is legal if the defender is facing the receiver.',
  },
  {
    id: 'roughing-passer',
    title: 'Roughing the passer',
    result: '15 yards. Automatic first down.',
    body: 'A defender hits the quarterback late, lands on him with his body weight, or drives him into the ground after it is clear the ball is gone. A hit a beat late, or to the head, is the usual version.',
  },
  {
    id: 'face-mask',
    title: 'Face mask',
    result: '15 yards.',
    body: 'A player grabs the face mask of an opponent and pulls or twists. Incidental brush is not the call. The flag is for the grab that yanks the head.',
  },
  {
    id: 'catch',
    title: 'What counts as a catch',
    result: 'No yards. This is a ruling, not a flag.',
    body: 'The receiver controls the ball, gets two feet or another body part down in bounds, and makes a football move, or maintains control through any contact with the ground. A bobble as he hits the ground is incomplete. If he is going to the ground as he catches it, he has to hold on all the way through.',
  },
  {
    id: 'grounding',
    title: 'Intentional grounding',
    result: 'Loss of down, and the ball is placed at the spot of the foul. Or 10 yards, whichever hurts more. The clock can run off.',
    body: 'The quarterback throws the ball away with no realistic chance for a receiver, and he is not outside the tackle box when he does it. From outside the pocket, a throw that reaches the line of scrimmage is legal even with no receiver nearby.',
  },
  {
    id: 'offensive-pi',
    title: 'Offensive pass interference',
    result: '10 yards. Replay the down.',
    body: 'A receiver pushes off or otherwise blocks a defender’s path before the ball arrives, to create the catch. A little contact at the top of a route is not always enough. A shove that separates the defender is.',
  },
  {
    id: 'roughness',
    title: 'Unnecessary roughness',
    result: '15 yards. Often an automatic first down.',
    body: 'A late hit, a hit on a player clearly out of the play, or a blow to the head or neck of a defenseless player. Leading with the helmet is in this family. It is a personal foul, not a holding call.',
  },
  {
    id: 'formation',
    title: 'Illegal formation, shift, and motion',
    result: '5 yards. Same down.',
    body: 'Offense must have seven players on the line at the snap. After a shift, everyone must be set for a beat. Only one player may be in motion at the snap, and he cannot be moving toward the line. Two people still moving is the common version.',
  },
  {
    id: 'ineligible',
    title: 'Ineligible receiver downfield',
    result: '5 yards. Replay the down.',
    body: 'A lineman who is not eligible to catch a pass is more than a yard downfield before a forward pass is thrown. It shows up on screen passes and play-action when a tackle releases early.',
  },
  {
    id: 'too-many',
    title: 'Too many players',
    result: '5 yards. Same down.',
    body: 'Twelve or more players on the field for either side when the ball is snapped. Substitutes have to get off before the snap. If the offense snaps while the defense is still subbing, the officials can shut it down.',
  },
  {
    id: 'taunting',
    title: 'Taunting and unsportsmanlike conduct',
    result: '15 yards.',
    body: 'Celebrating at an opponent, using abusive language toward an official, or other conduct the rule calls out as baiting. A celebration toward your own bench is generally fine. One aimed at the other team is the flag.',
  },
  {
    id: 'block-in-back',
    title: 'Illegal block in the back',
    result: '10 yards.',
    body: 'A block from behind, above the waist, in the back. It is common on returns. A block at the side is legal. A shove squarely in the back is not.',
  },
  {
    id: 'chop',
    title: 'Chop block',
    result: '15 yards.',
    body: 'One offensive player blocks a defender high while a teammate blocks him low. It is illegal because the defender cannot protect his legs. A single low block, by itself, can be legal.',
  },
  {
    id: 'horse-collar',
    title: 'Horse-collar tackle',
    result: '15 yards.',
    body: 'A defender grabs the inside collar of the shoulder pads or jersey and pulls the runner down from behind. The grab from inside the back of the pads is the foul, not every tackle from the rear.',
  },
  {
    id: 'kicker',
    title: 'Roughing or running into the kicker',
    result: 'Roughing is 15 yards and an automatic first down. Running into the kicker is 5 yards.',
    body: 'A defender who has a clear path and still crashes into the kicker after the kick is roughing. Grazing him when blocked into the kick is often just running into the kicker, or no flag at all. The punter is protected, but a defender who touches the kick is not fouling.',
  },
  {
    id: 'scoring',
    title: 'Touchdowns, extra points, and two-point tries',
    result: 'Touchdown is 6. Kick is 1. A run or pass into the end zone is 2.',
    body: 'The ball has to break the plane of the goal line while a runner has possession, or be caught in the end zone. After a touchdown the offense chooses a kick from the 15-yard line or a play from the 2. A missed try is dead. It is not a live ball the defense can return, except on a blocked kick in specific cases.',
  },
  {
    id: 'overtime',
    title: 'Overtime',
    result: 'No penalty. A way to finish a tied game.',
    body: 'In the regular season, if the team that receives the kickoff scores a touchdown, the game ends. A field goal does not end it. The other team still gets a possession. In the playoffs, both teams get a possession even if the first team scores a touchdown. After that, the next score wins. This is the recent setup, and the league can change it.',
  },
  {
    id: 'replay',
    title: 'Challenges and replay',
    result: 'A lost challenge costs a timeout.',
    body: 'A coach can throw a challenge flag on a reviewable call. He starts with two. He keeps one if he wins. Inside the last two minutes of each half, and in overtime, only the booth can trigger a review. Scoring plays and turnovers are already looked at. Judgment calls such as holding and pass interference are not reviewable, except pass interference has been reviewable in some seasons and not others. Treat this line as the usual idea, not a locked statute.',
  },
  {
    id: 'grounding-spot',
    title: 'Where the ball is spotted after a foul',
    result: 'Depends on the foul.',
    body: 'Some fouls, like a false start, come from the line of scrimmage and the down is replayed. Spot fouls, like defensive pass interference, move the ball to where it happened. Personal fouls are usually 15 yards and often an automatic first down. If both teams foul on the same play, the flags can offset and the down is replayed.',
  },
]
