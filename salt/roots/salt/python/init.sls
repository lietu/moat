{% for pkg in 'python-setuptools', 'python-dev', 'python-pip' %}
{{ pkg }}:
    pkg.installed
{% endfor %}

pip:
    pip.installed:
    - name: pip >= 1.4.0
    - upgrade: True
    - require:
        - pkg: python-pip

{% for pkg in 'virtualenv', 'virtualenvwrapper' %}
{{ pkg }}:
    pip.installed:
        - require:
            - pkg: python-pip
{% endfor %}

/home/moat/.virtualenvs:
    file.directory:
        - user: moat
        - group: moat
        - dir_mode: 00755
        - file_mode: 00644

/home/moat/.virtualenvs/moat:
    virtualenv.managed:
    - system_site_packages: False
    - requirements: /src/server/requirements.txt
    - user: moat
