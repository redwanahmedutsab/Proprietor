from django.http import JsonResponse


def test_api(request):
    return JsonResponse({
        "message": "Design and Developed by Redwan Ahmed Utsab."
    })
