# Generated by Django 3.1.5 on 2021-02-28 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0009_auto_20210228_2330'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='med_id',
            field=models.CharField(default='2d72e9ecc098', max_length=255),
        ),
    ]