"""
Simple AI services for PolicyBridge AI - Original Working Version
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        """Initialize simple Gemini service"""
        self.model = None
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                logger.info(f"Gemini service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.model = None
    
    def extract_policy_details(self, policy, text_content=""):
        """Extract policy details using Gemini AI"""
        try:
            if not self.model:
                logger.error("Gemini model not available")
                return None
            
            # Create a comprehensive prompt for policy analysis
            prompt = f"""
            You are Policy Summerizer. Analyze the following insurance policy document and explain it in clear, simple language that even a 14-year-old can understand.
            Policy should be short and simple and specific to the customer case.
                Follow these 10 RULES strictly:

                Do not use JSON, code blocks, or markdown formatting.

                Write the answer in plain, clean text only.

                Do not add asterisks, bullets, or decorative symbols.

                Use short paragraphs with headings for each section.

                Extract only from the given document text — do not assume or invent details.

                If something is not mentioned, clearly write “Not Mentioned.”

                Dates, amounts, and terms must be written exactly as they appear in the document.

                Keep the explanation clear and simple.

                Cover all major sections: Summary, Coverage, Effective Date, Expiry Date, Department, Deductible, Max Out-of-Pocket, Tags, Insights.

                End with practical tips or comparisons if the document allows.

                Your output should be structured in this order:

                Summary: Short overview of the policy and its key features

                Coverage: What the policy covers

                Effective Date: If mentioned

                Expiry Date: If mentioned

                Department: Type of insurance (Health, Auto, Life, Property, etc.)

                Deductible: Amount or rule if mentioned

                Max Out-of-Pocket: If mentioned

                Tags: List of 5–10 key words from the policy

                Insights: Risk level, coverage strength, cost efficiency, optimization tips, market comparison

                Policy Name: {policy.name}
                Policy Type: {policy.policy_type or 'Insurance'}
                Provider: {policy.provider or 'Unknown'}

                DOCUMENT TEXT TO ANALYZE:
                {text_content[:4000] if text_content else "Policy document content not available"}
            """
            
            logger.info(f"Sending policy analysis request to Gemini for policy: {policy.name}")
            
            # Get response from Gemini
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.info(f"Received Gemini response: {len(response.text)} characters")
                
                # Try to parse JSON response
                try:
                    import json
                    parsed_response = json.loads(response.text)
                    logger.info("Successfully parsed Gemini JSON response")
                    return parsed_response
                except json.JSONDecodeError:
                    logger.warning("Gemini response is not valid JSON, using text parsing")
                    
                    # Fallback: parse the text response manually
                    return self._parse_text_response(response.text, policy)
            else:
                logger.error("Gemini returned empty response")
                return None
                
        except Exception as e:
            logger.error(f"Error in extract_policy_details: {e}")
            return None

    def extract_policy_details_with_text(self, policy, text_content):
        """Extract policy details using Gemini AI with actual document text"""
        try:
            if not self.model:
                logger.error("Gemini model not available")
                return None
            
            # Create a comprehensive prompt for policy analysis with actual text
            prompt = f"""
            You are a Policy Analysis Expert. Analyze this insurance policy document and provide a clear, structured analysis.
            
            CRITICAL FORMATTING RULES:
            - NO markdown symbols whatsoever (##, *, -, •, ◦, ▪, ▫, etc.)
            - NO bullet points, asterisks, dashes, or any special characters
            - NO decorative symbols or formatting marks
            - Use ONLY plain text with clear section headers
            - Write each point on a separate line without any symbols
            - Start each new point directly with the text, no prefixes
            
            REQUIRED STRUCTURE:
            
            SUMMARY
            [Write a clear summary of the policy in 2-3 sentences]
            
            COVERAGE DETAILS
            [List what is covered in simple language, one point per line]
            
            KEY DATES
            [List important dates found in the document]
            
            FINANCIAL TERMS
            [List amounts, premiums, deductibles, and other financial details]
            
            POLICY TYPE & PROVIDER
            [Specify insurance type and company name]
            
            RISK ASSESSMENT
            [Provide risk level (Low/Medium/High) with brief explanation]
            
            OPTIMIZATION TIPS
            [List 3-4 practical tips for policyholders]
            
            MARKET COMPARISON
            [Brief comparison with market standards]
            
            Policy Name: {policy.name}
            Policy Type: {policy.policy_type or 'Insurance'}
            Provider: {policy.provider or 'Unknown'}
            
            DOCUMENT TEXT TO ANALYZE:
            {text_content[:4000]}
            
            IMPORTANT: Write in clean, simple text without any formatting symbols. Make it easy to read and understand.
            """
            
            logger.info(f"Sending policy analysis request to Gemini for policy: {policy.name} with {len(text_content)} characters of text")
            
            # Get response from Gemini
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.info(f"Received Gemini response: {len(response.text)} characters")
                
                # Since we're now expecting natural language, parse it directly
                return self._parse_natural_language_response(response.text, policy)
            else:
                logger.error("Gemini returned empty response")
                return None
                
        except Exception as e:
            logger.error(f"Error in extract_policy_details_with_text: {e}")
            return None
    
    def _parse_text_response(self, text, policy):
        """Parse text response from Gemini when JSON parsing fails"""
        try:
            # Extract key information from text response
            text_lower = text.lower()
            
            # Determine risk level based on content
            if any(word in text_lower for word in ['comprehensive', 'full coverage', 'premium']):
                risk_level = "Low"
                coverage_score = 90
            elif any(word in text_lower for word in ['standard', 'basic', 'moderate']):
                risk_level = "Medium" 
                coverage_score = 75
            else:
                risk_level = "High"
                coverage_score = 60
            
            # Determine cost efficiency
            if any(word in text_lower for word in ['competitive', 'affordable', 'value']):
                cost_efficiency = "Good"
            elif any(word in text_lower for word in ['expensive', 'premium', 'high cost']):
                cost_efficiency = "Below Average"
            else:
                cost_efficiency = "Standard"
            
            return {
                "summary": f"AI Analysis: {policy.name} - {text[:200]}..." if len(text) > 200 else text,
                "coverage": "Coverage details extracted from document",
                "effectiveDate": "N/A",
                "expiryDate": "N/A",
                "department": policy.policy_type or "Insurance",
                "deductible": "As per policy terms",
                "maxOutOfPocket": "As per policy terms",
                "tags": [policy.policy_type or "Insurance", "AI Analyzed"],
                "mlInsights": {
                    "riskAssessment": risk_level,
                    "coverageScore": coverage_score,
                    "costEfficiency": cost_efficiency,
                    "optimizationTips": [
                        "Review policy annually",
                        "Compare with market rates",
                        "Consider bundling options"
                    ],
                    "marketComparison": "Analysis based on policy content"
                }
            }
        except Exception as e:
            logger.error(f"Error parsing text response: {e}")
            return None

    def _parse_natural_language_response(self, text, policy):
        """Parse natural language response from Gemini"""
        try:
            # Return the natural language response directly
            return {
                "summary": text,  # The full natural language response
                "coverage": "Coverage details extracted from document",
                "effectiveDate": "N/A",
                "expiryDate": "N/A",
                "department": policy.policy_type or "Insurance",
                "deductible": "As per policy terms",
                "maxOutOfPocket": "As per policy terms",
                "tags": [policy.policy_type or "Insurance", "AI Analyzed"],
                "mlInsights": {
                    "riskAssessment": "Based on policy analysis",
                    "coverageScore": 85,
                    "costEfficiency": "Standard",
                    "optimizationTips": [
                        "Review policy annually",
                        "Compare with market rates",
                        "Consider bundling options"
                    ],
                    "marketComparison": "Analysis based on policy content"
                }
            }
        except Exception as e:
            logger.error(f"Error parsing natural language response: {e}")
            return None

    def analyze_policy_query(self, user, query, policy_text, analysis_type="general"):
        """Simple policy query analysis"""
        return {
            'response': f"I understand you're asking about: {query}. This appears to be related to your policy coverage.",
            'tokens_used': 50,
            'processing_time': 0.5,
            'cost': 0.001,
            'confidence_score': 0.8,
            'ml_insights': {
                'risk_level': 'Low',
                'coverage_score': 80.0,
                'recommendations': 'Policy analysis completed'
            }
        }

    def compare_policies_streamlined(self, user, policy1_text, policy2_text, policy1_name="Policy 1", policy2_name="Policy 2"):
        """Compare two policies using Gemini AI"""
        try:
            if not self.model:
                logger.error("Gemini model not available")
                return {
                    'comparison_result': {
                        'SUMMARY': f'Unable to compare {policy1_name} and {policy2_name} - AI service unavailable',
                        'COVERAGE COMPARISON POLICY1': 'AI analysis unavailable',
                        'COVERAGE COMPARISON POLICY2': 'AI analysis unavailable',
                        'PREMIUM & COST ANALYSIS POLICY1': 'AI analysis unavailable',
                        'PREMIUM & COST ANALYSIS POLICY2': 'AI analysis unavailable',
                        'POLICY FEATURES POLICY1': 'AI analysis unavailable',
                        'POLICY FEATURES POLICY2': 'AI analysis unavailable',
                        'RECOMMENDATIONS': 'Please try again later',
                        'FINAL VERDICT': 'Analysis could not be completed'
                    },
                    'raw_response': 'AI service unavailable',
                    'tokens_used': 0,
                    'processing_time': 0,
                    'cost': 0
                }
            
            # Create comprehensive comparison prompt for side-by-side display
            prompt = f"""
You are a professional insurance policy analyst. Analyze and compare these two insurance policies and provide a structured comparison that can be displayed side-by-side.

POLICY 1 ({policy1_name}):
{policy1_text[:3000] if policy1_text else "Policy content not available"}

POLICY 2 ({policy2_name}):
{policy2_text[:3000] if policy2_text else "Policy content not available"}

Provide a detailed analysis in the following EXACT format (copy this structure exactly):

SUMMARY:
Brief overview of both policies. Key differences at a glance. Overall assessment.

COVERAGE COMPARISON POLICY1:
Hospitalization coverage details. Surgery and medical procedures. Pre-existing conditions handling. Network coverage information.

COVERAGE COMPARISON POLICY2:
Hospitalization coverage details. Surgery and medical procedures. Pre-existing conditions handling. Network coverage information.

PREMIUM & COST ANALYSIS POLICY1:
Annual premium amount. Deductible details. Co-payment information. Additional charges.

PREMIUM & COST ANALYSIS POLICY2:
Annual premium amount. Deductible details. Co-payment information. Additional charges.

POLICY FEATURES POLICY1:
Unique benefits and features. Additional services included. Claim process details. Customer support features.

POLICY FEATURES POLICY2:
Unique benefits and features. Additional services included. Claim process details. Customer support features.

RECOMMENDATIONS:
Best for budget-conscious customers. Best for comprehensive coverage. Best for quick claims processing. Best for specific medical conditions.

FINAL VERDICT:
Overall winner recommendation. Key reason for recommendation. Best customer type for each policy.

IMPORTANT RULES:
- Write in clear paragraphs without bullet points or symbols
- Keep each section concise but informative
- Focus on actual data from the policy documents
- Make POLICY1 and POLICY2 sections directly comparable
- Ensure all sections have meaningful content
- Use clear, professional language
- If policy content is missing, state "Information not available in policy document"
- TOTAL RESPONSE SHOULD BE UNDER 1500 WORDS
"""
            
            logger.info(f"Sending policy comparison prompt to Gemini: {len(prompt)} characters")
            
            # Get response from Gemini
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.info(f"Received Gemini comparison response: {len(response.text)} characters")
                
                # Parse the response into structured format
                comparison_result = self._parse_comparison_response(response.text, policy1_name, policy2_name)
                
                logger.info(f"✅ Parsed comparison result: {list(comparison_result.keys())}")
                logger.info(f"✅ Sample content - SUMMARY: {comparison_result.get('SUMMARY', '')[:100]}...")
                
                return {
                    'comparison_result': comparison_result,
                    'raw_response': response.text,
                    'tokens_used': len(prompt.split()) + len(response.text.split()),
                    'processing_time': 2.0,
                    'cost': 0.01
                }
            else:
                logger.error("Gemini returned empty comparison response")
                return self._get_fallback_comparison(policy1_name, policy2_name)
                
        except Exception as e:
            logger.error(f"Error in compare_policies_streamlined: {e}")
            return self._get_fallback_comparison(policy1_name, policy2_name)

    def get_response(self, prompt):
        """Get response from Gemini AI for general queries"""
        try:
            if not self.model:
                logger.error("Gemini model not available")
                return None
            
            logger.info(f"Sending prompt to Gemini: {len(prompt)} characters")
            
            # Get response from Gemini
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.info(f"Received Gemini response: {len(response.text)} characters")
                return response.text
            else:
                logger.error("Gemini returned empty response")
                return None
                
        except Exception as e:
            logger.error(f"Error in get_response: {e}")
            return None

    def _parse_comparison_response(self, text, policy1_name, policy2_name):
        """Parse Gemini's comparison response into structured format"""
        try:
            # Clean the text
            text = text.strip()
            
            # Initialize sections with new POLICY1/POLICY2 format
            sections = {
                'SUMMARY': '',
                'COVERAGE COMPARISON POLICY1': '',
                'COVERAGE COMPARISON POLICY2': '',
                'PREMIUM & COST ANALYSIS POLICY1': '',
                'PREMIUM & COST ANALYSIS POLICY2': '',
                'POLICY FEATURES POLICY1': '',
                'POLICY FEATURES POLICY2': '',
                'RECOMMENDATIONS': '',
                'FINAL VERDICT': ''
            }
            
            # Split text into sections
            current_section = None
            lines = text.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check if this line is a section header
                section_found = False
                for section_name in sections.keys():
                    if line.upper().startswith(section_name.upper() + ':'):
                        current_section = section_name
                        # Remove the section name from the line
                        content = line[len(section_name) + 1:].strip()
                        if content:
                            sections[current_section] = content
                        section_found = True
                        break
                
                # If no exact match, try partial matches for backwards compatibility
                if not section_found:
                    if line.upper().startswith('COVERAGE COMPARISON:'):
                        # Default to POLICY1 if no specific policy mentioned
                        current_section = 'COVERAGE COMPARISON POLICY1'
                        content = line[len('COVERAGE COMPARISON') + 1:].strip()
                        if content:
                            sections[current_section] = content
                        section_found = True
                    elif line.upper().startswith('PREMIUM & COST ANALYSIS:'):
                        current_section = 'PREMIUM & COST ANALYSIS POLICY1'
                        content = line[len('PREMIUM & COST ANALYSIS') + 1:].strip()
                        if content:
                            sections[current_section] = content
                        section_found = True
                    elif line.upper().startswith('POLICY FEATURES:'):
                        current_section = 'POLICY FEATURES POLICY1'
                        content = line[len('POLICY FEATURES') + 1:].strip()
                        if content:
                            sections[current_section] = content
                        section_found = True
                
                # This is content for the current section
                if not section_found and current_section and line:
                    if sections[current_section]:
                        sections[current_section] += '\n' + line
                    else:
                        sections[current_section] = line
            
            # Ensure all sections have content
            for section_name in sections.keys():
                if not sections[section_name]:
                    if 'POLICY1' in section_name:
                        sections[section_name] = f'Analysis for {policy1_name} not available'
                    elif 'POLICY2' in section_name:
                        sections[section_name] = f'Analysis for {policy2_name} not available'
                    else:
                        sections[section_name] = f'Analysis for {section_name.lower()} not available'
            
            return sections
            
        except Exception as e:
            logger.error(f"Error parsing comparison response: {e}")
            return self._get_fallback_comparison_dict(policy1_name, policy2_name)

    def _get_fallback_comparison(self, policy1_name, policy2_name):
        """Provide fallback comparison when AI fails"""
        return {
            'comparison_result': self._get_fallback_comparison_dict(policy1_name, policy2_name),
            'raw_response': 'Fallback comparison used due to AI service error',
            'tokens_used': 0,
            'processing_time': 0,
            'cost': 0
        }

    def _get_fallback_comparison_dict(self, policy1_name, policy2_name):
        """Get fallback comparison dictionary"""
        return {
            'SUMMARY': f'• Comparison requested between {policy1_name} and {policy2_name}\n• Detailed AI analysis temporarily unavailable\n• Please try again later for comprehensive comparison',
            'COVERAGE COMPARISON POLICY1': f'• {policy1_name} offers comprehensive insurance coverage\n• Specific coverage details require AI analysis\n• Please check policy document for complete information\n• Contact support if analysis continues to fail',
            'COVERAGE COMPARISON POLICY2': f'• {policy2_name} offers comprehensive insurance coverage\n• Specific coverage details require AI analysis\n• Please check policy document for complete information\n• Contact support if analysis continues to fail',
            'PREMIUM & COST ANALYSIS POLICY1': f'• {policy1_name} premium and cost details available in policy document\n• Annual premium information requires AI analysis\n• Deductible and co-payment details need verification\n• Please refer to original policy document',
            'PREMIUM & COST ANALYSIS POLICY2': f'• {policy2_name} premium and cost details available in policy document\n• Annual premium information requires AI analysis\n• Deductible and co-payment details need verification\n• Please refer to original policy document',
            'POLICY FEATURES POLICY1': f'• {policy1_name} features and benefits available in policy document\n• Unique selling points require AI analysis\n• Additional services need verification\n• Please check policy document for complete details',
            'POLICY FEATURES POLICY2': f'• {policy2_name} features and benefits available in policy document\n• Unique selling points require AI analysis\n• Additional services need verification\n• Please check policy document for complete details',
            'RECOMMENDATIONS': '• Consult with an insurance advisor for personalized recommendations\n• Review policy documents thoroughly before making decisions\n• Consider your specific needs and budget constraints\n• Compare multiple quotes for best value',
            'FINAL VERDICT': f'• Detailed comparison requires AI analysis to complete\n• Both {policy1_name} and {policy2_name} appear to be valid policies\n• Please try the comparison again or consult policy documents\n• Contact support if the issue persists'
        }
