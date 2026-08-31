{{/*
Expand the name of the chart.
*/}}
{{- define "tooleasy.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "tooleasy.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "tooleasy.labels" -}}
helm.sh/chart: {{ include "tooleasy.chart" . }}
{{ include "tooleasy.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "tooleasy.selectorLabels" -}}
app.kubernetes.io/name: {{ include "tooleasy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
