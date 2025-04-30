
from graphviz import Digraph

def create_ieee_architecture_diagram():
    # Initialize IEEE standard diagram
    dot = Digraph(
        name='DrugCheck_Architecture',
        comment='DrugCheck System Architecture Diagram (IEEE 1471)',
        engine='dot'
    )
    
    # IEEE standard document settings
    dot.attr(
        rankdir='TB',
        compound='true',
        splines='ortho',
        concentrate='true',
        ranksep='1.8',  # Increased for better label placement
        nodesep='1.2',  # Increased for better spacing
        pad='0.5'
    )

    # Standard IEEE styling
    dot.attr(
        'graph',
        fontname='Times-Roman',
        fontsize='14',
        style='rounded',
        bgcolor='white'
    )

    # IEEE standard node styling
    dot.attr(
        'node',
        shape='rectangle',
        style='filled',
        fillcolor='white',
        color='black',
        fontname='Times-Roman',
        fontsize='12',
        height='0.6',
        width='1.6',
        margin='0.3,0.2'
    )

    # IEEE standard edge styling
    dot.attr(
        'edge',
        fontname='Times-Roman',
        fontsize='10',
        color='#000000',
        arrowsize='0.8',
        penwidth='1.0',
        xlabel_position='above'  # Position labels above edges
    )

    # System Context (External Entities)
    with dot.subgraph(name='cluster_context') as context:
        context.attr(
            label='System Context',
            style='dashed,rounded',
            color='#666666',
            fontname='Times-Roman',
            fontsize='14'
        )
        context.node('User', '«actor»\nHealthcare\nProfessional', shape='ellipse')
        context.node('RxNav', '«external system»\nRxNav API', shape='rectangle')
        context.node('MistralAI', '«external system»\nMistral AI API', shape='rectangle')

    # Presentation Tier
    with dot.subgraph(name='cluster_presentation') as presentation:
        presentation.attr(
            label='Presentation Tier',
            style='rounded',
            color='#333333',
            bgcolor='#f5f5f5'
        )
        presentation.node('WebUI', '«boundary»\nWeb Interface')
        with presentation.subgraph(name='cluster_ui_components') as ui:
            ui.attr(label='UI Components', style='rounded')
            ui.node('HomeView', '«component»\nHome View')
            ui.node('CheckerView', '«component»\nChecker View')
            ui.node('SearchView', '«component»\nSearch View')
            ui.node('ReportView', '«component»\nReport View')

    # Business Logic Tier
    with dot.subgraph(name='cluster_business') as business:
        business.attr(
            label='Business Logic Tier',
            style='rounded',
            color='#333333',
            bgcolor='#f0f0f0'
        )
        with business.subgraph(name='cluster_services') as services:
            services.attr(label='Core Services', style='rounded')
            services.node('DrugService', '«service»\nDrug Service')
            services.node('AnalysisService', '«service»\nAnalysis Service')
            services.node('ReportService', '«service»\nReport Service')
            services.node('ValidationService', '«service»\nValidation Service')

    # Data Tier
    with dot.subgraph(name='cluster_data') as data:
        data.attr(
            label='Data Tier',
            style='rounded',
            color='#333333',
            bgcolor='#e8e8e8'
        )
        data.node('CacheStore', '«storage»\nCache Store', shape='cylinder')
        data.node('StateStore', '«storage»\nState Store', shape='cylinder')

    # Define relationships using IEEE notation with xlabels
    # User Interactions
    dot.edge('User', 'WebUI', xlabel='«uses»')
    dot.edge('WebUI', 'HomeView', xlabel='«forwards»')
    dot.edge('WebUI', 'CheckerView', xlabel='«forwards»')
    dot.edge('WebUI', 'SearchView', xlabel='«forwards»')
    dot.edge('WebUI', 'ReportView', xlabel='«forwards»')

    # View to Service Communication
    dot.edge('CheckerView', 'DrugService', xlabel='«invokes»')
    dot.edge('SearchView', 'DrugService', xlabel='«invokes»')
    dot.edge('ReportView', 'ReportService', xlabel='«invokes»')
    dot.edge('ReportView', 'AnalysisService', xlabel='«invokes»')

    # Service Dependencies
    dot.edge('DrugService', 'ValidationService', xlabel='«uses»')
    dot.edge('AnalysisService', 'ValidationService', xlabel='«uses»')
    dot.edge('DrugService', 'RxNav', xlabel='«calls»')
    dot.edge('AnalysisService', 'MistralAI', xlabel='«calls»')

    # Data Access
    dot.edge('DrugService', 'CacheStore', xlabel='«reads/writes»')
    dot.edge('DrugService', 'StateStore', xlabel='«manages»')
    dot.edge('AnalysisService', 'StateStore', xlabel='«manages»')
    dot.edge('ReportService', 'StateStore', xlabel='«manages»')

    # Generate high-resolution output
    dot.attr(dpi='300')
    dot.render('DrugCheck_IEEE_Architecture', format='png', cleanup=True)

if __name__ == "__main__":
    create_ieee_architecture_diagram()

