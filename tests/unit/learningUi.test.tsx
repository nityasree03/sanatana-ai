import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonQuiz } from "@/components/learning/LessonQuiz";
import { getLesson } from "@/lib/learning/lessons";

const lesson = getLesson("nachiketa-three-boons")!;
const refs = {
  "katha-1.1.9": "Katha Upanishad 1.1.9",
  "katha-1.1.10": "Katha Upanishad 1.1.10",
  "katha-1.1.29": "Katha Upanishad 1.1.29",
};

describe("LessonQuiz", () => {
  it("needs a choice before checking, then shows the supporting line and a link to the verse", () => {
    render(<LessonQuiz questions={lesson.questions} refs={refs} />);
    const q1 = screen.getByRole("group", { name: /1\. Why does Yama offer/ });
    const check = within(q1).getByRole("button", { name: "Check answer 1" });
    expect(check).toBeDisabled();
    fireEvent.click(within(q1).getByRole("radio", { name: /stayed three nights/ }));
    fireEvent.click(check);
    expect(within(q1).getByText("Right.")).toBeVisible();
    expect(within(q1).getByText(/remained three nights in my house without food/)).toBeVisible();
    expect(within(q1).getByRole("link", { name: "Katha Upanishad 1.1.9" })).toHaveAttribute(
      "href",
      "#katha-1.1.9",
    );
    for (const r of within(q1).getAllByRole("radio")) expect(r).toBeDisabled();
  });

  it("names the right answer when the choice is wrong, and scores and resets the round", () => {
    render(<LessonQuiz questions={lesson.questions} refs={refs} />);
    const answer = (n: number, option: RegExp) => {
      const g = screen.getByRole("group", { name: new RegExp(`^${n}\\.`) });
      fireEvent.click(within(g).getByRole("radio", { name: option }));
      fireEvent.click(within(g).getByRole("button", { name: `Check answer ${n}` }));
      return g;
    };
    answer(1, /stayed three nights/);
    const g2 = answer(2, /Wealth and long life/);
    expect(within(g2).getByText(/Not quite\. The answer is: That his father/)).toBeVisible();
    expect(within(g2).getByText("· your answer")).toBeVisible();
    expect(within(g2).getByText("· correct")).toBeVisible();
    answer(3, /hidden secret/);
    expect(screen.getByText("You answered 2 of 3 from the verses.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByText(/You answered/)).toBeNull();
    expect(screen.getByRole("button", { name: "Check answer 1" })).toBeDisabled();
  });
});
