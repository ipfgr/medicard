# Generated by Django 3.1.5 on 2021-02-26 03:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0014_auto_20210225_2209'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='med_id',
            field=models.CharField(default='5fb87ebe36f0', max_length=255),
        ),
    ]
