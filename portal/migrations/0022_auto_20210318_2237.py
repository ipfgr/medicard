# Generated by Django 3.1.5 on 2021-03-18 15:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0021_auto_20210318_2142'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recognizedfiles',
            name='file_name',
        ),
        migrations.AlterField(
            model_name='user',
            name='med_id',
            field=models.CharField(default='875325af10a8', max_length=255),
        ),
    ]
