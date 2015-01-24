moat:
    group.present:
        - system: False
    user.present:
        - fullname: Moat game
        - shell: /bin/bash
        - home: /home/moat
        - groups:
            - moat

/home/moat/.bashrc:
    file.managed:
        - source: salt://basic/bashrc
        - user: moat
        - group: moat
        - mode: 700

/home/moat/:
    file.directory:
        - user: moat
        - group: moat
        - mode: 750
        - makedirs: True

# Bunch of useful tools people want on machines
{% for pkg in 'gcc', 'vim', 'nano', 'lsof', 'wget', 'curl', 'strace', 'bzip2' %}
{{ pkg }}:
    pkg.installed
{% endfor %}
