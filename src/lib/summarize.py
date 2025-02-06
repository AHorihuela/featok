from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import sys
import json

def generate_title(ideas):
    """Generate a title from a list of ideas using LSA summarization."""
    if not ideas:
        return "My Ideas"
    
    # Combine all idea titles and descriptions
    text = " ".join([f"{idea['title']}. {idea['description']}" for idea in ideas])
    
    # Create parser
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    
    # Create summarizer
    stemmer = Stemmer("english")
    summarizer = LsaSummarizer(stemmer)
    summarizer.stop_words = get_stop_words("english")
    
    # Get summary (1 sentence)
    summary = summarizer(parser.document, 1)
    
    if not summary:
        return ideas[0]['title']
    
    # Clean up and format the title
    title = str(summary[0]).strip()
    # Truncate if too long
    if len(title) > 50:
        title = title[:47] + "..."
    
    return title

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("My Ideas")
        sys.exit(1)
        
    try:
        ideas = json.loads(sys.argv[1])
        title = generate_title(ideas)
        print(title)
    except Exception as e:
        print("My Ideas")
        sys.exit(1) 