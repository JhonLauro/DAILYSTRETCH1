from django.core.management.base import BaseCommand
from dailystretch_app.models import Routine

ROUTINES = [
    {
        'title': 'Desk Stretches',
        'description': 'Quick stretches to relieve tension from sitting',
        'category': 'stretch',
        'difficulty': 'beginner',
        'duration_text': '5 min',
        'duration_minutes': 5,
        'instructions': 'Sit upright. Feet flat. Lift arms overhead. Stretch side to side, hold for 20 seconds each. Roll shoulders back three times. Interlace fingers behind, open chest and hold for 30 seconds. Repeat as needed.'
    },
    {
        'title': 'Deep Breathing Exercise',
        'description': 'Calm your mind and reduce stress with controlled breathing',
        'category': 'breathing',
        'difficulty': 'beginner',
        'duration_text': '3 min',
        'duration_minutes': 3,
        'instructions': 'Sit comfortably. Breathe in through your nose for 4 seconds, hold for 4 seconds, exhale through your mouth for 4 seconds, hold for 4 seconds. Repeat this cycle.'
    },
    {
        'title': '20-20-20 Eye Rest',
        'description': 'Reduce eye strain from screen time',
        'category': 'eye-care',
        'difficulty': 'advanced',
        'duration_text': '20 min',
        'duration_minutes': 20,
        'instructions': 'Look at something 20 feet away for 20 seconds every 20 minutes. Blink slowly ten times to refresh eyes.'
    },
    {
        'title': 'Standing Full Body Stretch',
        'description': 'Energizing stretch routine for your whole body',
        'category': 'stretch',
        'difficulty': 'beginner',
        'duration_text': '7 min',
        'duration_minutes': 7,
        'instructions': 'Stand upright, feet hip-width apart. Reach arms to sky, stretch upwards. Lean gently left and right. Touch toes, hold 15 seconds. Roll up slowly. Repeat as needed.'
    },
    {
        'title': 'Mindful Meditation',
        'description': 'Short meditation to reset your mind',
        'category': 'meditation',
        'difficulty': 'beginner',
        'duration_text': '5 min',
        'duration_minutes': 5,
        'instructions': 'Sit comfortably, close your eyes. Breathe slowly and deeply. Focus on your breath. When thoughts appear, let them pass. Continue quietly.'
    },
    {
        'title': 'Wrist and Hand Relief',
        'description': 'Stretches for hands and wrists to prevent strain',
        'category': 'stretch',
        'difficulty': 'beginner',
        'duration_text': '4 min',
        'duration_minutes': 4,
        'instructions': 'Extend one arm forward, palm up. Gently pull fingers back with other hand. Switch hands after 20 seconds. Make a loose fist, roll wrists clockwise and counterclockwise.'
    },
    {
        'title': 'Box Breathing',
        'description': 'Advanced breathing technique for focus and calm',
        'category': 'breathing',
        'difficulty': 'intermediate',
        'duration_text': '4 min',
        'duration_minutes': 4,
        'instructions': 'Sit upright, shoulders relaxed. Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat 8 cycles.'
    },
    {
        'title': 'Hip and Lower Back Release',
        'description': 'Gentle stretches for lower body relief',
        'category': 'stretch',
        'difficulty': 'intermediate',
        'duration_text': '6 min',
        'duration_minutes': 6,
        'instructions': 'Lie on back, hug knees in toward chest. Hold for 30 seconds. Cross right ankle over left knee, pull left thigh toward you. Switch sides after 30 seconds.'
    },
    {
        'title': 'Progressive Muscle Relaxation',
        'description': 'Systematic tension and release for deep relaxation',
        'category': 'meditation',
        'difficulty': 'intermediate',
        'duration_text': '8 min',
        'duration_minutes': 8,
        'instructions': 'Sit or lie down. Tense muscle groups gently (feet, calves, thighs, hands, arms, face). Hold 5 seconds, then release. Work through all groups from feet to head.'
    },
    {
        'title': 'Energizing Morning Routine',
        'description': 'Wake up your body and mind for the day ahead',
        'category': 'stretch',
        'difficulty': 'intermediate',
        'duration_text': '10 min',
        'duration_minutes': 10,
        'instructions': 'Stand, reach arms and legs out. Gentle jumping jacks and arm circles. Deep breaths in, stretching side to side. Finish with forward bend for 30 seconds.'
    },
    {
        'title': 'Computer Vision Syndrome Relief',
        'description': 'Comprehensive eye exercises for screen workers',
        'category': 'eye-care',
        'difficulty': 'intermediate',
        'duration_text': '5 min',
        'duration_minutes': 5,
        'instructions': 'Blink quickly for 10 seconds. Look left, right, up, down for 15 seconds each. Focus near and far objects for 30 seconds.'
    },
    {
        'title': 'Posture Reset',
        'description': 'Correct your posture and align your spine',
        'category': 'stretch',
        'difficulty': 'advanced',
        'duration_text': '8 min',
        'duration_minutes': 8,
        'instructions': 'Sit tall, shoulders relaxed. Pull chin backwards slightly. Hold arms out, rotate palms up and down. Stretch neck side to side.'
    },
]


class Command(BaseCommand):
    help = 'Seed default routines into the database (idempotent)'

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for r in ROUTINES:
            obj, was_created = Routine.objects.update_or_create(
                title=r['title'],
                defaults={
                    'description': r.get('description', ''),
                    'category': r.get('category', ''),
                    'difficulty': r.get('difficulty', ''),
                    'duration_text': r.get('duration_text', ''),
                    'duration_minutes': r.get('duration_minutes'),
                    'instructions': r.get('instructions', '')
                }
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f'Seed complete. Created: {created}, Updated: {updated}'))
