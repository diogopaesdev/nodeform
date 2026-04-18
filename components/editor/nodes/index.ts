import { PresentationNode } from "./presentation-node";
import { SingleChoiceNode } from "./single-choice-node";
import { MultipleChoiceNode } from "./multiple-choice-node";
import { RatingNode } from "./rating-node";
import { EndScreenNode } from "./end-screen-node";
import { TextInputNode } from "./text-input-node";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeTypes: any = {
  presentation: PresentationNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  rating: RatingNode,
  endScreen: EndScreenNode,
  textInput: TextInputNode,
};

export { PresentationNode, SingleChoiceNode, MultipleChoiceNode, RatingNode, EndScreenNode, TextInputNode };
