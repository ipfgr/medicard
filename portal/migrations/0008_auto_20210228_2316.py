# Generated by Django 3.1.5 on 2021-02-28 16:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0007_auto_20210228_2316'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='med_id',
            field=models.CharField(default='1a73e5763cb1', max_length=255),
        ),
    ]
