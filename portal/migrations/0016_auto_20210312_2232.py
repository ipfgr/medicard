# Generated by Django 3.1.5 on 2021-03-12 15:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0015_auto_20210312_2232'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='med_id',
            field=models.CharField(default='5df9960b80f4', max_length=255),
        ),
        migrations.AlterField(
            model_name='user',
            name='passport',
            field=models.CharField(default=None, max_length=64, null=True, unique=True),
        ),
    ]
