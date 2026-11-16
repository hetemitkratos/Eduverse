import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.db.database import SessionLocal, init_db
from src.db.schema.models import Quiz
from src.modules.content.repository.loader import load_content_dataset


def seed_quiz_data() -> int:
    init_db()
    dataset = load_content_dataset()
    db = SessionLocal()
    inserted_or_updated = 0

    try:
        existing_rows = {
            (row.topic, row.question): row
            for row in db.query(Quiz).all()
        }

        for topic_key, topic_payload in dataset.items():
            topic_name = topic_payload.get("topic", topic_key)

            for question_payload in topic_payload.get("quiz", []):
                identity = (topic_name, question_payload["question"])
                existing = existing_rows.get(identity)

                if existing:
                    existing.options = question_payload.get("options", [])
                    existing.correct = question_payload.get(
                        "correct",
                        question_payload.get("answer", ""),
                    )
                    existing.concept = question_payload.get("concept")
                    existing.difficulty = question_payload.get("difficulty", "easy")
                else:
                    db.add(
                        Quiz(
                            topic=topic_name,
                            question=question_payload["question"],
                            options=question_payload.get("options", []),
                            correct=question_payload.get(
                                "correct",
                                question_payload.get("answer", ""),
                            ),
                            concept=question_payload.get("concept"),
                            difficulty=question_payload.get("difficulty", "easy"),
                        )
                    )

                inserted_or_updated += 1

        db.commit()
        return inserted_or_updated
    finally:
        db.close()


if __name__ == "__main__":
    total = seed_quiz_data()
    print(f"Seeded {total} quiz questions.")
